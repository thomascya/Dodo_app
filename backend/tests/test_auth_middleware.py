from unittest.mock import patch

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.middleware.auth import get_current_user, require_auth


def _make_test_app():
    """Create a minimal FastAPI app with auth-protected routes for testing."""
    test_app = FastAPI()

    @test_app.get("/public")
    async def public_route(user=Depends(get_current_user)):
        return {"user": user}

    @test_app.get("/protected")
    async def protected_route(user=Depends(require_auth)):
        return {"user_id": user["id"]}

    return test_app


JWT_SECRET = "test-jwt-secret"


def _make_token(expired=False):
    import jwt
    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    exp = now - timedelta(hours=1) if expired else now + timedelta(hours=1)
    payload = {
        "sub": "user-123",
        "email": "test@example.com",
        "role": "authenticated",
        "aud": "authenticated",
        "iat": now,
        "exp": exp,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


@patch("app.middleware.auth.settings")
def test_public_route_no_token(mock_settings):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    app = _make_test_app()
    client = TestClient(app)
    response = client.get("/public")
    assert response.status_code == 200
    assert response.json()["user"] is None


@patch("app.middleware.auth.settings")
def test_public_route_with_valid_token(mock_settings):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    app = _make_test_app()
    client = TestClient(app)
    token = _make_token()
    response = client.get("/public", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["id"] == "user-123"
    assert data["user"]["email"] == "test@example.com"


@patch("app.middleware.auth.settings")
def test_public_route_with_expired_token(mock_settings):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    app = _make_test_app()
    client = TestClient(app)
    token = _make_token(expired=True)
    response = client.get("/public", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Token expired"


@patch("app.middleware.auth.settings")
def test_public_route_with_invalid_token(mock_settings):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    app = _make_test_app()
    client = TestClient(app)
    response = client.get("/public", headers={"Authorization": "Bearer garbage-token"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid token"


@patch("app.middleware.auth.settings")
def test_protected_route_no_token(mock_settings):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    app = _make_test_app()
    client = TestClient(app)
    response = client.get("/protected")
    assert response.status_code == 401
    assert response.json()["detail"] == "Authentication required"


@patch("app.middleware.auth.settings")
def test_protected_route_with_valid_token(mock_settings):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    app = _make_test_app()
    client = TestClient(app)
    token = _make_token()
    response = client.get("/protected", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["user_id"] == "user-123"


@patch("app.middleware.auth.settings")
def test_wrong_jwt_secret_rejects(mock_settings):
    mock_settings.SUPABASE_JWT_SECRET = "wrong-secret"
    app = _make_test_app()
    client = TestClient(app)
    token = _make_token()  # Signed with JWT_SECRET, not "wrong-secret"
    response = client.get("/public", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
