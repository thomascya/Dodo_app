from app.services.supabase_client import get_supabase


async def follow_user(follower_id: str, following_id: str) -> dict:
    if follower_id == following_id:
        raise ValueError("Cannot follow yourself")
    result = (
        get_supabase()
        .table("follows")
        .insert({"follower_id": follower_id, "following_id": following_id})
        .execute()
    )
    return result.data[0]


async def unfollow_user(follower_id: str, following_id: str) -> None:
    (
        get_supabase()
        .table("follows")
        .delete()
        .eq("follower_id", follower_id)
        .eq("following_id", following_id)
        .execute()
    )


async def get_following(user_id: str) -> list[dict]:
    result = (
        get_supabase()
        .table("follows")
        .select("id, following_id, created_at, following:users!following_id(id, name, profile_image, is_verified)")
        .eq("follower_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


async def get_follower_count(user_id: str) -> int:
    result = (
        get_supabase()
        .table("follows")
        .select("id", count="exact")
        .eq("following_id", user_id)
        .execute()
    )
    return result.count or 0
