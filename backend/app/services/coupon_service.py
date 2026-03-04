from datetime import datetime, timezone

from app.services.supabase_client import get_supabase

COUPON_SELECT = (
    "id, user_id, store_id, code, discount_type, discount_value, "
    "description, redemption_type, expires_at, is_active, created_at, "
    "user:users(id, name, profile_image, is_verified)"
)


async def get_coupons_by_store(store_id: str) -> list[dict]:
    result = (
        get_supabase()
        .table("coupons")
        .select(COUPON_SELECT)
        .eq("store_id", store_id)
        .eq("is_active", True)
        .gt("expires_at", datetime.now(timezone.utc).isoformat())
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


async def get_coupons_by_following(user_id: str) -> list[dict]:
    """Get coupons from users that the current user follows."""
    sb = get_supabase()
    # Get list of followed user IDs
    follows = sb.table("follows").select("following_id").eq("follower_id", user_id).execute()
    following_ids = [f["following_id"] for f in follows.data]
    if not following_ids:
        return []
    result = (
        sb.table("coupons")
        .select(COUPON_SELECT)
        .in_("user_id", following_ids)
        .eq("is_active", True)
        .gt("expires_at", datetime.now(timezone.utc).isoformat())
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return result.data


async def create_coupon(user_id: str, data: dict) -> dict:
    result = (
        get_supabase()
        .table("coupons")
        .insert({
            "user_id": user_id,
            "store_id": data["store_id"],
            "code": data["code"],
            "discount_type": data["discount_type"],
            "discount_value": data["discount_value"],
            "description": data.get("description"),
            "redemption_type": data["redemption_type"],
            "expires_at": data["expires_at"],
        })
        .execute()
    )
    return result.data[0]


async def update_coupon(coupon_id: str, user_id: str, data: dict) -> dict | None:
    sb = get_supabase()
    # Verify ownership
    existing = sb.table("coupons").select("user_id").eq("id", coupon_id).maybe_single().execute()
    if not existing.data or existing.data["user_id"] != user_id:
        return None
    result = sb.table("coupons").update(data).eq("id", coupon_id).execute()
    return result.data[0] if result.data else None


async def delete_coupon(coupon_id: str, user_id: str) -> bool:
    sb = get_supabase()
    # Verify ownership
    existing = sb.table("coupons").select("user_id").eq("id", coupon_id).maybe_single().execute()
    if not existing.data or existing.data["user_id"] != user_id:
        return False
    sb.table("coupons").delete().eq("id", coupon_id).execute()
    return True


async def is_user_influencer(user_id: str) -> bool:
    result = (
        get_supabase()
        .table("users")
        .select("is_influencer, is_verified")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )
    if not result.data:
        return False
    return result.data["is_influencer"] and result.data["is_verified"]
