from unittest.mock import MagicMock, patch


SAMPLE_BENEFITS = [
    {
        "id": "b-uuid-1",
        "store_id": "s-uuid-1",
        "wallet_id": "w-uuid-1",
        "discount_type": "percentage",
        "discount_value": 10.0,
        "description": "10% off online",
        "redemption_type": "online",
        "start_date": None,
        "end_date": None,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
        "wallet": {"name": "Visa", "type": "credit_card"},
    },
    {
        "id": "b-uuid-2",
        "store_id": "s-uuid-1",
        "wallet_id": "w-uuid-2",
        "discount_type": "fixed",
        "discount_value": 50.0,
        "description": "50 NIS off",
        "redemption_type": "both",
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "is_active": True,
        "created_at": "2026-01-02T00:00:00Z",
        "wallet": {"name": "Club Max", "type": "club"},
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


@patch("app.services.benefit_service.get_supabase")
def test_get_benefits_by_store(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase(SAMPLE_BENEFITS)

    response = client.get("/api/benefits/store/s-uuid-1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["wallet"]["name"] == "Visa"
    assert data[1]["discount_type"] == "fixed"


@patch("app.services.benefit_service.get_supabase")
def test_get_benefits_by_store_empty(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase([])

    response = client.get("/api/benefits/store/nonexistent")
    assert response.status_code == 200
    assert response.json() == []


@patch("app.services.benefit_service.get_supabase")
def test_get_benefits_by_wallets(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase(SAMPLE_BENEFITS)

    response = client.get("/api/benefits/wallets?ids=w-uuid-1,w-uuid-2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_benefits_by_wallets_empty_ids(client):
    response = client.get("/api/benefits/wallets?ids=")
    assert response.status_code == 200
    assert response.json() == []


def test_get_benefits_by_wallets_no_param(client):
    response = client.get("/api/benefits/wallets")
    assert response.status_code == 200
    assert response.json() == []
