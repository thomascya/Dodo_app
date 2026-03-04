from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_auth
from app.services.follow_service import follow_user, get_follower_count, get_following, unfollow_user

router = APIRouter()


@router.post("/{user_id}")
async def follow(user_id: str, current_user: dict = Depends(require_auth)):
    try:
        result = await follow_user(current_user["id"], user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{user_id}")
async def unfollow(user_id: str, current_user: dict = Depends(require_auth)):
    await unfollow_user(current_user["id"], user_id)
    return {"status": "ok"}


@router.get("/following")
async def list_following(current_user: dict = Depends(require_auth)):
    return await get_following(current_user["id"])


@router.get("/{user_id}/followers/count")
async def follower_count(user_id: str):
    count = await get_follower_count(user_id)
    return {"count": count}
