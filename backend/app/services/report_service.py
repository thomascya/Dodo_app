from app.services.supabase_client import get_supabase


async def create_report(user_id: str, coupon_id: str, reason: str, details: str | None) -> dict:
    result = (
        get_supabase()
        .table("reports")
        .insert({
            "coupon_id": coupon_id,
            "user_id": user_id,
            "reason": reason,
            "details": details,
            "status": "pending",
        })
        .execute()
    )
    return result.data[0]
