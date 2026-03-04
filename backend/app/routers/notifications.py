from fastapi import APIRouter, Depends

from app.middleware.auth import require_auth
from app.models.schemas import RegisterPushTokenRequest
from app.services.notification_service import register_push_token, unregister_push_token

router = APIRouter()


@router.post("/register", status_code=201)
async def register_token(
    body: RegisterPushTokenRequest,
    current_user: dict = Depends(require_auth),
):
    result = await register_push_token(
        user_id=current_user["id"],
        expo_push_token=body.expo_push_token,
    )
    return result


@router.delete("/register")
async def unregister_token(
    body: RegisterPushTokenRequest,
    current_user: dict = Depends(require_auth),
):
    removed = await unregister_push_token(
        user_id=current_user["id"],
        expo_push_token=body.expo_push_token,
    )
    if removed:
        return {"status": "removed"}
    return {"status": "not_found"}
