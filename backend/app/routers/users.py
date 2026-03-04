from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_auth
from app.models.schemas import UserUpdate
from app.services.user_service import get_user_by_id, update_user

router = APIRouter()


@router.get("/me")
async def get_me(current_user: dict = Depends(require_auth)):
    profile = await get_user_by_id(current_user["id"])
    if profile is None:
        raise HTTPException(status_code=404, detail="User not found")
    return profile


@router.put("/me")
async def update_me(body: UserUpdate, current_user: dict = Depends(require_auth)):
    result = await update_user(current_user["id"], body.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result


@router.get("/{user_id}")
async def get_user(user_id: str):
    profile = await get_user_by_id(user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="User not found")
    return profile
