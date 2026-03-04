from unittest.mock import AsyncMock, MagicMock, patch

SAMPLE_SESSION = {
    "access_token": "test-access-token",
    "refresh_token": "test-refresh-token",
    "user_id": "user-uuid-123",
    "email": "test@example.com",
}

SAMPLE_USER_PROFILE = {
    "id": "user-uuid-123",
    "email": "test@example.com",
    "name": "Test User",
    "profile_image": None,
    "bio": None,
    "is_influencer": False,
    "is_verified": False,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z",
}


def _patch_auth_service():
    """Patch auth service functions for testing."""
    return {
        "sign_up": patch(
            "app.routers.auth.sign_up_with_email",
            new_callable=AsyncMock,
            return_value=SAMPLE_SESSION,
        ),
        "sign_in_email": patch(
            "app.routers.auth.sign_in_with_email",
            new_callable=AsyncMock,
            return_value=SAMPLE_SESSION,
        ),
        "sign_in_social": patch(
            "app.routers.auth.sign_in_with_social",
            new_callable=AsyncMock,
            return_value=SAMPLE_SESSION,
        ),
        "sign_in_guest": patch(
            "app.routers.auth.sign_in_as_guest",
            new_callable=AsyncMock,
            return_value=SAMPLE_SESSION,
        ),
        "refresh": patch(
            "app.routers.auth.refresh_session",
            new_callable=AsyncMock,
            return_value=SAMPLE_SESSION,
        ),
        "sign_out": patch(
            "app.routers.auth.sign_out",
            new_callable=AsyncMock,
        ),
        "ensure_user": patch(
            "app.routers.auth.ensure_user_record",
            new_callable=AsyncMock,
            return_value=SAMPLE_USER_PROFILE,
        ),
        "get_profile": patch(
            "app.routers.auth.get_user_profile",
            new_callable=AsyncMock,
            return_value=SAMPLE_USER_PROFILE,
        ),
    }


def test_signup_email(client):
    patches = _patch_auth_service()
    with patches["sign_up"], patches["ensure_user"]:
        response = client.post(
            "/api/auth/signup/email",
            json={"email": "new@example.com", "password": "secure123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "test-access-token"
        assert data["user"]["email"] == "test@example.com"


def test_signup_email_short_password(client):
    response = client.post(
        "/api/auth/signup/email",
        json={"email": "new@example.com", "password": "123"},
    )
    assert response.status_code == 422  # Pydantic validation error


def test_signin_email(client):
    patches = _patch_auth_service()
    with patches["sign_in_email"], patches["ensure_user"]:
        response = client.post(
            "/api/auth/signin/email",
            json={"email": "test@example.com", "password": "secure123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "test-access-token"
        assert data["refresh_token"] == "test-refresh-token"


def test_signin_email_failure(client):
    patches = _patch_auth_service()
    mock_sign_in = patches["sign_in_email"]
    with mock_sign_in as mock_fn, patches["ensure_user"]:
        mock_fn.side_effect = Exception("Invalid login credentials")
        response = client.post(
            "/api/auth/signin/email",
            json={"email": "bad@example.com", "password": "wrong123"},
        )
        assert response.status_code == 401


def test_signin_social_google(client):
    patches = _patch_auth_service()
    with patches["sign_in_social"], patches["ensure_user"]:
        response = client.post(
            "/api/auth/signin/social",
            json={"provider": "google", "id_token": "google-id-token-123"},
        )
        assert response.status_code == 200
        assert response.json()["access_token"] == "test-access-token"


def test_signin_social_invalid_provider(client):
    response = client.post(
        "/api/auth/signin/social",
        json={"provider": "facebook", "id_token": "token"},
    )
    assert response.status_code == 422  # Pydantic rejects invalid provider


def test_guest_signin(client):
    patches = _patch_auth_service()
    with patches["sign_in_guest"], patches["ensure_user"]:
        response = client.post("/api/auth/guest")
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user" in data


def test_refresh_token(client):
    patches = _patch_auth_service()
    with patches["refresh"], patches["ensure_user"]:
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": "old-refresh-token"},
        )
        assert response.status_code == 200
        assert response.json()["access_token"] == "test-access-token"


def test_refresh_token_failure(client):
    patches = _patch_auth_service()
    mock_refresh = patches["refresh"]
    with mock_refresh as mock_fn, patches["ensure_user"]:
        mock_fn.side_effect = Exception("Invalid refresh token")
        response = client.post(
            "/api/auth/refresh",
            json={"refresh_token": "bad-token"},
        )
        assert response.status_code == 401


@patch("app.middleware.auth.settings")
def test_get_me(mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = "test-secret-that-is-long-enough-32chars"
    patches = _patch_auth_service()

    import jwt as pyjwt
    from datetime import datetime, timedelta, timezone

    token = pyjwt.encode(
        {
            "sub": "user-uuid-123",
            "email": "test@example.com",
            "role": "authenticated",
            "aud": "authenticated",
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        },
        "test-secret-that-is-long-enough-32chars",
        algorithm="HS256",
    )

    with patches["get_profile"]:
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"
        assert response.json()["is_influencer"] is False


def test_get_me_no_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


@patch("app.middleware.auth.settings")
def test_signout(mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = "test-secret-that-is-long-enough-32chars"
    patches = _patch_auth_service()

    import jwt as pyjwt
    from datetime import datetime, timedelta, timezone

    token = pyjwt.encode(
        {
            "sub": "user-uuid-123",
            "email": "test@example.com",
            "role": "authenticated",
            "aud": "authenticated",
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        },
        "test-secret-that-is-long-enough-32chars",
        algorithm="HS256",
    )

    with patches["sign_out"]:
        response = client.post(
            "/api/auth/signout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


def test_signout_no_token(client):
    response = client.post("/api/auth/signout")
    assert response.status_code == 401
