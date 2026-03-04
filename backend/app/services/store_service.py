from app.services.supabase_client import get_supabase

STORE_SELECT = "id, name, logo, website, is_active, created_at"


async def get_stores() -> list[dict]:
    result = (
        get_supabase()
        .table("stores")
        .select(STORE_SELECT)
        .eq("is_active", True)
        .order("name", desc=False)
        .execute()
    )
    return result.data


async def get_store_by_id(store_id: str) -> dict | None:
    result = (
        get_supabase()
        .table("stores")
        .select(STORE_SELECT)
        .eq("id", store_id)
        .maybe_single()
        .execute()
    )
    return result.data


async def search_stores(query: str) -> list[dict]:
    if not query.strip():
        return []
    result = (
        get_supabase()
        .table("stores")
        .select(STORE_SELECT)
        .ilike("name", f"%{query}%")
        .eq("is_active", True)
        .limit(20)
        .execute()
    )
    return result.data
