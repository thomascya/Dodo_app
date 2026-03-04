from unittest.mock import MagicMock, patch

JWT_SECRET = "test-secret-that-is-long-enough-32chars"


def _make_token(user_id="user-123"):
    import jwt
    from datetime import datetime, timedelta, timezone

    return jwt.encode(
        {"sub": user_id, "email": "t@t.com", "role": "authenticated",
         "aud": "authenticated", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        JWT_SECRET, algorithm="HS256",
    )


def _mock_supabase_insert(return_data):
    mock_client = MagicMock()
    chain = mock_client.table.return_value.insert.return_value
    mock_result = MagicMock()
    mock_result.data = [return_data] if isinstance(return_data, dict) else return_data
    chain.execute.return_value = mock_result
    return mock_client


def _mock_supabase_chain(return_data, count=None):
    mock_client = MagicMock()
    chain = mock_client.table.return_value.select.return_value
    for method in ("eq", "order", "limit", "delete"):
        getattr(chain, method).return_value = chain
    mock_result = MagicMock()
    mock_result.data = return_data
    mock_result.count = count
    chain.execute.return_value = mock_result
    # Also support delete chain
    del_chain = mock_client.table.return_value.delete.return_value
    for method in ("eq",):
        getattr(del_chain, method).return_value = del_chain
    del_chain.execute.return_value = MagicMock()
    return mock_client


@patch("app.middleware.auth.settings")
@patch("app.services.follow_service.get_supabase")
def test_follow_user(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_sb.return_value = _mock_supabase_insert({
        "id": "f-1", "follower_id": "user-123", "following_id": "user-456",
        "created_at": "2026-01-01T00:00:00Z",
    })

    response = client.post(
        "/api/follows/user-456",
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 200
    assert response.json()["following_id"] == "user-456"


@patch("app.middleware.auth.settings")
@patch("app.services.follow_service.get_supabase")
def test_follow_self_rejected(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET

    response = client.post(
        "/api/follows/user-123",
        headers={"Authorization": f"Bearer {_make_token('user-123')}"},
    )
    assert response.status_code == 400
    assert "yourself" in response.json()["detail"].lower()


@patch("app.middleware.auth.settings")
@patch("app.services.follow_service.get_supabase")
def test_unfollow_user(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_sb.return_value = _mock_supabase_chain([])

    response = client.delete(
        "/api/follows/user-456",
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_follow_no_auth(client):
    response = client.post("/api/follows/user-456")
    assert response.status_code == 401


@patch("app.middleware.auth.settings")
@patch("app.services.follow_service.get_supabase")
def test_get_follower_count(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_sb.return_value = _mock_supabase_chain([], count=42)

    response = client.get("/api/follows/user-456/followers/count")
    assert response.status_code == 200
    assert response.json()["count"] == 42
