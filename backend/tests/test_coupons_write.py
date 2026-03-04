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


COUPON_BODY = {
    "store_id": "store-1",
    "code": "SAVE20",
    "discount_type": "percentage",
    "discount_value": 20,
    "redemption_type": "online",
    "expires_at": "2026-12-31T00:00:00Z",
}

CREATED_COUPON = {
    "id": "c-new",
    "user_id": "user-123",
    **COUPON_BODY,
    "description": None,
    "is_active": True,
    "created_at": "2026-01-01T00:00:00Z",
}


def _mock_supabase_for_create(is_influencer=True):
    mock_client = MagicMock()

    # For is_user_influencer check
    user_chain = MagicMock()
    user_result = MagicMock()
    user_result.data = {"is_influencer": is_influencer, "is_verified": is_influencer}
    user_chain.execute.return_value = user_result
    # Chain: table().select().eq().maybe_single().execute()
    select_chain = mock_client.table.return_value.select.return_value
    select_chain.eq.return_value.maybe_single.return_value = user_chain

    # For insert
    insert_chain = mock_client.table.return_value.insert.return_value
    insert_result = MagicMock()
    insert_result.data = [CREATED_COUPON]
    insert_chain.execute.return_value = insert_result

    return mock_client


@patch("app.middleware.auth.settings")
@patch("app.services.coupon_service.get_supabase")
def test_create_coupon_as_influencer(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_sb.return_value = _mock_supabase_for_create(is_influencer=True)

    response = client.post(
        "/api/coupons",
        json=COUPON_BODY,
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 201
    assert response.json()["code"] == "SAVE20"


@patch("app.middleware.auth.settings")
@patch("app.services.coupon_service.get_supabase")
def test_create_coupon_non_influencer_rejected(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_sb.return_value = _mock_supabase_for_create(is_influencer=False)

    response = client.post(
        "/api/coupons",
        json=COUPON_BODY,
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 403


def test_create_coupon_no_auth(client):
    response = client.post("/api/coupons", json=COUPON_BODY)
    assert response.status_code == 401


def test_create_coupon_invalid_body(client):
    response = client.post(
        "/api/coupons",
        json={"code": "X"},
        headers={"Authorization": "Bearer fake"},
    )
    assert response.status_code in (401, 422)


@patch("app.middleware.auth.settings")
@patch("app.services.coupon_service.get_supabase")
def test_delete_coupon_owner(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_client = MagicMock()
    # Ownership check
    select_chain = mock_client.table.return_value.select.return_value
    ownership_result = MagicMock()
    ownership_result.data = {"user_id": "user-123"}
    select_chain.eq.return_value.maybe_single.return_value.execute.return_value = ownership_result
    # Delete
    del_chain = mock_client.table.return_value.delete.return_value
    del_chain.eq.return_value.execute.return_value = MagicMock()
    mock_sb.return_value = mock_client

    response = client.delete(
        "/api/coupons/c-1",
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 200


@patch("app.middleware.auth.settings")
@patch("app.services.coupon_service.get_supabase")
def test_delete_coupon_not_owner(mock_sb, mock_settings, client):
    mock_settings.SUPABASE_JWT_SECRET = JWT_SECRET
    mock_client = MagicMock()
    select_chain = mock_client.table.return_value.select.return_value
    ownership_result = MagicMock()
    ownership_result.data = {"user_id": "other-user"}
    select_chain.eq.return_value.maybe_single.return_value.execute.return_value = ownership_result
    mock_sb.return_value = mock_client

    response = client.delete(
        "/api/coupons/c-1",
        headers={"Authorization": f"Bearer {_make_token()}"},
    )
    assert response.status_code == 404
