from unittest.mock import MagicMock, patch


SAMPLE_STORES = [
    {
        "id": "uuid-1",
        "name": "Nike",
        "logo": "https://example.com/nike.png",
        "website": "https://nike.com",
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "uuid-2",
        "name": "Adidas",
        "logo": None,
        "website": "https://adidas.com",
        "is_active": True,
        "created_at": "2026-01-02T00:00:00Z",
    },
]


def _mock_supabase(return_data, use_maybe_single=False):
    """Create a mock Supabase client with chained query builder."""
    mock_client = MagicMock()
    chain = mock_client.table.return_value.select.return_value

    # Every PostgREST method returns itself for chaining
    for method in ("eq", "ilike", "in_", "gt", "order", "limit", "maybe_single"):
        getattr(chain, method).return_value = chain

    if use_maybe_single:
        chain.maybe_single.return_value = chain

    mock_result = MagicMock()
    mock_result.data = return_data
    chain.execute.return_value = mock_result

    return mock_client


@patch("app.services.store_service.get_supabase")
def test_get_stores(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase(SAMPLE_STORES)

    response = client.get("/api/stores")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Nike"
    assert data[1]["name"] == "Adidas"


@patch("app.services.store_service.get_supabase")
def test_get_stores_empty(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase([])

    response = client.get("/api/stores")
    assert response.status_code == 200
    assert response.json() == []


@patch("app.services.store_service.get_supabase")
def test_get_store_by_id(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase(SAMPLE_STORES[0], use_maybe_single=True)

    response = client.get("/api/stores/uuid-1")
    assert response.status_code == 200
    assert response.json()["name"] == "Nike"


@patch("app.services.store_service.get_supabase")
def test_get_store_by_id_not_found(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase(None, use_maybe_single=True)

    response = client.get("/api/stores/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Store not found"


@patch("app.services.store_service.get_supabase")
def test_search_stores(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase([SAMPLE_STORES[0]])

    response = client.get("/api/stores/search?q=nik")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Nike"


@patch("app.services.store_service.get_supabase")
def test_search_stores_empty_query(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase([])

    response = client.get("/api/stores/search?q=")
    assert response.status_code == 200
    assert response.json() == []


@patch("app.services.store_service.get_supabase")
def test_search_stores_no_results(mock_get_sb, client):
    mock_get_sb.return_value = _mock_supabase([])

    response = client.get("/api/stores/search?q=zzzzz")
    assert response.status_code == 200
    assert response.json() == []
