from unittest.mock import MagicMock, patch

JWT_SECRET = "test-secret-that-is-long-enough-32chars"

SAMPLE_USER = {
    "id": "user-123",
    "email": "test@example.com",
    "name": "Test User",
    "profile_image": None,
    "bio": None,
    "is_influencer": False,
    "is_verified": False,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z",
}


def _make_token(user_id="user-123"):
    import jwt
    from datetime import datetime, timedelta, timezone

    return jwt.encode(
        {"sub": user_id, "email": "t@t.com", "role": "authenticated",
         "aud": "authenticated", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        JWT_SECRET, algorithm="HS256",
    )


def _mock_supabase_select(return_data):
    mock_client = MagicMock()
    chain = mock_client.table.return_value.select.return_value
    for method in ("eq", "maybe_single", "order"):
        getattr(chain, method).return_value = chain
    mock_result = MagicMock()
    mock_result.data = return_data
    chain.execute.return_value = mock_result
    return mock_client


def _mock_supabase_update(return_data):
    mock_client = MagicMock()
    # For update
    update_chain = mock_client.table.return_value.update.return_value
    update_chain.eq.return_value = update_chain
    update_result = MagicMock()
    update_result.data = [return_data] if isinstance(return_data, dict) else return_data
    update_chain.execute.return_value = update_result
    return mock_client


@patch("app.middleware.auth.settings")
@patch("app.services.user_service.get_supabase")
def test_get_my_profile(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_sb.return_value = _mock_supabase_select(SAMPLE_USER)

    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


def test_get_my_profile_no_auth(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401


@patch("app.middleware.auth.settings")
@patch("app.services.user_service.get_supabase")
def test_update_my_profile(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    updated = {**SAMPLE_USER, "name": "New Name"}
    mock_sb.return_value = _mock_supabase_update(updated)

    response = client.put(
        "/api/users/me",
        json={"name": "New Name"},
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"


@patch("app.services.user_service.get_supabase")
def test_get_public_user(mock_sb, client):
    mock_sb.return_value = _mock_supabase_select(SAMPLE_USER)

    response = client.get("/api/users/user-123")
    assert response.status_code == 200
    assert response.json()["id"] == "user-123"


@patch("app.services.user_service.get_supabase")
def test_get_public_user_not_found(mock_sb, client):
    mock_sb.return_value = _mock_supabase_select(None)

    response = client.get("/api/users/nonexistent")
    assert response.status_code == 404
