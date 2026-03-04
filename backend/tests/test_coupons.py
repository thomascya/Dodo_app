from unittest.mock import MagicMock, patch


SAMPLE_COUPONS = [
    {
        "id": "c-uuid-1",
        "user_id": "u-uuid-1",
        "store_id": "s-uuid-1",
        "code": "SAVE20",
        "discount_type": "percentage",
        "discount_value": 20.0,
        "description": "20% off everything",
        "redemption_type": "online",
        "expires_at": "2026-12-31T00:00:00Z",
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
        "user": {
            "id": "u-uuid-1",
            "name": "Test Influencer",
            "profile_image": None,
            "is_verified": True,
        },
    },
]


def _mock_supabase(return_data):
    mock_client = MagicMock()
    chain = mock_client.table.return_value.select.return_value
    for method in ("eq", "ilike", "in_", "gt", "order", "limit"):
        getattr(chain, method).return_value = chain
    mock_result = MagicMock()
    mock_result.data = return_data
    chain.execute.return_value = mock_result
    return mock_client


@patch("app.services.coupon_service.get_supabase")
def test_get_coupons_by_store(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase(SAMPLE_COUPONS)

    response = client.get("/api/coupons/store/s-uuid-1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["code"] == "SAVE20"
    assert data[0]["user"]["name"] == "Test Influencer"
    assert data[0]["user"]["is_verified"] is True


@patch("app.services.coupon_service.get_supabase")
def test_get_coupons_by_store_empty(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase([])

    response = client.get("/api/coupons/store/nonexistent")
    assert response.status_code == 200
    assert response.json() == []


@patch("app.services.coupon_service.get_supabase")
def test_coupon_response_includes_user_join(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase(SAMPLE_COUPONS)

    response = client.get("/api/coupons/store/s-uuid-1")
    data = response.json()
    user = data[0]["user"]
    assert "id" in user
    assert "name" in user
    assert "profile_image" in user
    assert "is_verified" in user
