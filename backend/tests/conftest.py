import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def jwt_secret():
    return "test-jwt-secret"


@pytest.fixture
def make_token(jwt_secret):
    """Create a valid JWT for testing authenticated endpoints."""
    import jwt as pyjwt

    def _make(
        user_id: str = "test-user-uuid",
        email: str = "test@example.com",
        role: str = "authenticated",
        expired: bool = False,
    ) -> str:
        from datetime import datetime, timedelta, timezone

        now = datetime.now(timezone.utc)
        exp = now - timedelta(hours=1) if expired else now + timedelta(hours=1)
        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
            "aud": "authenticated",
            "iat": now,
            "exp": exp,
        }
        return pyjwt.encode(payload, jwt_secret, algorithm="HS256")

    return _make


@pytest.fixture
def auth_headers(make_token):
    token = make_token()
    return {"Authorization": f"Bearer {token}"}
