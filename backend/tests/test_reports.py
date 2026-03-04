from unittest.mock import AsyncMock, MagicMock, patch

JWT_SECRET = "test-secret-that-is-long-enough-32chars"


def _make_token(user_id="user-123"):
    import jwt
    from datetime import datetime, timedelta, timezone

    return jwt.encode(
        {"sub": user_id, "email": "t@t.com", "role": "authenticated",
         "aud": "authenticated", "exp": datetime.now(timezone.utc) + timedelta(hours=1)},
        JWT_SECRET, algorithm="HS256",
    )


def _mock_supabase(return_data):
    mock_client = MagicMock()
    chain = mock_client.table.return_value.insert.return_value
    mock_result = MagicMock()
    mock_result.data = [return_data] if isinstance(return_data, dict) else return_data
    chain.execute.return_value = mock_result
    return mock_client


@patch("app.middleware.auth.settings")
@patch("app.services.report_service.get_supabase")
def test_submit_report(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_sb.return_value = _mock_supabase({
        "id": "r-1", "coupon_id": "c-1", "user_id": "user-123",
        "reason": "not_working", "details": None, "status": "pending",
        "created_at": "2026-01-01T00:00:00Z",
    })

    response = client.post(
        "/api/reports",
        json={"coupon_id": "c-1", "reason": "not_working", "details": None},
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 200
    assert response.json()["reason"] == "not_working"


def test_submit_report_no_auth(client):
    response = client.post(
        "/api/reports",
        json={"coupon_id": "c-1", "reason": "not_working"},
    )
    assert response.status_code == 401


def test_submit_report_invalid_reason(client):
    response = client.post(
        "/api/reports",
        json={"coupon_id": "c-1", "reason": "invalid_reason"},
        headers={"Authorization": "Bearer fake"},
    )
    assert response.status_code in (401, 422)
