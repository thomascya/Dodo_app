from app.services.supabase_client import get_supabase

BENEFIT_SELECT = (
    "id, store_id, wallet_id, discount_type, discount_value, "
    "description, redemption_type, start_date, end_date, "
    "is_active, created_at, wallet:wallets(name, type)"
)


async def get_benefits_by_store(store_id: str) -> list[dict]:
    result = (
        get_supabase()
        .table("benefits")
        .select(BENEFIT_SELECT)
        .eq("store_id", store_id)
        .eq("is_active", True)
        .execute()
    )
    return result.data


async def get_benefits_by_wallets(wallet_ids: list[str]) -> list[dict]:
    if not wallet_ids:
        return []
    result = (
        get_supabase()
        .table("benefits")
        .select(BENEFIT_SELECT)
        .in_("wallet_id", wallet_ids)
        .eq("is_active", True)
        .order("discount_value", desc=True)
        .limit(50)
        .execute()
    )
    return result.data
