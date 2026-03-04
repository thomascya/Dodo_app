from app.services.supabase_client import get_supabase


async def get_user_by_id(user_id: str) -> dict | None:
    result = (
        get_supabase()
        .table("users")
        .select("*")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    return result.data


async def update_user(user_id: str, data: dict) -> dict | None:
    update_fields = {k: v for k, v in data.items() if v is not None}
    if not update_fields:
        return await get_user_by_id(user_id)
    result = (
        get_supabase()
        .table("users")
        .update(update_fields)
        .eq("id", user_id)
        .execute()
    )
    return result.data[0] if result.data else None


async def get_user_wallets(user_id: str) -> list[dict]:
    result = (
        get_supabase()
        .table("user_wallets")
        .select("wallet_id, wallet:wallets(id, name, type, logo)")
        .eq("user_id", user_id)
        .execute()
    )
    return [row["wallet"] for row in result.data if row.get("wallet")]


async def update_user_wallets(user_id: str, wallet_ids: list[str]) -> list[dict]:
    sb = get_supabase()
    # Delete existing
    sb.table("user_wallets").delete().eq("user_id", user_id).execute()
    # Insert new
    if wallet_ids:
        rows = [{"user_id": user_id, "wallet_id": wid} for wid in wallet_ids]
        sb.table("user_wallets").insert(rows).execute()
    return await get_user_wallets(user_id)
