from app.services.supabase_client import get_supabase

WALLET_SELECT = "id, name, type, logo, is_active, created_at"


async def get_wallets() -> list[dict]:
    result = (
        get_supabase()
        .table("wallets")
        .select(WALLET_SELECT)
        .eq("is_active", True)
        .order("name", desc=False)
        .execute()
    )
    return result.data
