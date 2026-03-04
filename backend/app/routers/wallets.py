from fastapi import APIRouter, Depends

from app.middleware.auth import require_auth
from app.models.schemas import UserWalletUpdate
from app.services.user_service import get_user_wallets, update_user_wallets
from app.services.wallet_service import get_wallets

router = APIRouter()


@router.get("/")
async def list_wallets():
    return await get_wallets()


@router.get("/me")
async def my_wallets(current_user: dict = Depends(require_auth)):
    return await get_user_wallets(current_user["id"])


@router.put("/me")
async def update_my_wallets(body: UserWalletUpdate, current_user: dict = Depends(require_auth)):
    return await update_user_wallets(current_user["id"], body.wallet_ids)
