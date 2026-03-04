from unittest.mock import MagicMock, patch


SAMPLE_WALLETS = [
    {
        "id": "w-uuid-1",
        "name": "Visa Cal",
        "type": "credit_card",
        "logo": "https://example.com/visa.png",
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "w-uuid-2",
        "name": "Club 365",
        "type": "club",
        "logo": None,
        "is_active": True,
        "created_at": "2026-01-02T00:00:00Z",
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


@patch("app.services.wallet_service.get_supabase")
def test_get_wallets(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase(SAMPLE_WALLETS)

    response = client.get("/api/wallets")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Visa Cal"
    assert data[0]["type"] == "credit_card"
    assert data[1]["type"] == "club"


@patch("app.services.wallet_service.get_supabase")
def test_get_wallets_empty(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase([])

    response = client.get("/api/wallets")
    assert response.status_code == 200
    assert response.json() == []
