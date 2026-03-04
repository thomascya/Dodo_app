import logging

import httpx

from app.config import settings
from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)


async def register_push_token(user_id: str, expo_push_token: str) -> dict:
    """Register an Expo push token for a user (upsert)."""
    result = (
        get_supabase()
        .table("push_tokens")
        .upsert(
            {"user_id": user_id, "expo_push_token": expo_push_token},
            on_conflict="user_id,expo_push_token",
        )
        .execute()
    )
    return result.data[0]


async def unregister_push_token(user_id: str, expo_push_token: str) -> bool:
    """Remove a push token for a user."""
    result = (
        get_supabase()
        .table("push_tokens")
        .delete()
        .eq("user_id", user_id)
        .eq("expo_push_token", expo_push_token)
        .execute()
    )
    return len(result.data) > 0


async def get_user_push_tokens(user_id: str) -> list[str]:
    """Get all push tokens for a user."""
    result = (
        get_supabase()
        .table("push_tokens")
        .select("expo_push_token")
        .eq("user_id", user_id)
        .execute()
    )
    return [row["expo_push_token"] for row in result.data]


async def send_push_notifications(
    tokens: list[str],
    title: str,
    body: str,
    data: dict | None = None,
) -> None:
    """Send push notifications via Expo's free push API."""
    if not tokens:
        return

    messages = [
        {
            "to": token,
            "title": title,
            "body": body,
            "sound": "default",
            **({"data": data} if data else {}),
        }
        for token in tokens
    ]

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                settings.EXPO_PUSH_URL,
                json=messages,
                headers={
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
            )
            if response.status_code != 200:
                logger.error("Expo push failed: %s %s", response.status_code, response.text)
    except Exception:
        logger.exception("Failed to send push notifications")


async def notify_followers_new_coupon(user_id: str, store_name: str) -> None:
    """Notify all followers of a user when they post a new coupon."""
    sb = get_supabase()
    # Get follower IDs
    follows = (
        sb.table("follows")
        .select("follower_id")
        .eq("following_id", user_id)
        .execute()
    )
    follower_ids = [f["follower_id"] for f in follows.data]
    if not follower_ids:
        return

    # Get push tokens for all followers
    all_tokens: list[str] = []
    for fid in follower_ids:
        tokens = await get_user_push_tokens(fid)
        all_tokens.extend(tokens)

    if all_tokens:
        await send_push_notifications(
            tokens=all_tokens,
            title="קופון חדש!",
            body=f"קופון חדש פורסם ב-{store_name}",
            data={"type": "new_coupon", "user_id": user_id},
        )
