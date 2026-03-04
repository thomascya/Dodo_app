from fastapi import APIRouter, Query

from app.services.benefit_service import get_benefits_by_store, get_benefits_by_wallets

router = APIRouter()


@router.get("/store/{store_id}")
async def benefits_by_store(store_id: str):
    return await get_benefits_by_store(store_id)


@router.get("/wallets")
async def benefits_by_wallets(ids: str = Query("", description="Comma-separated wallet IDs")):
    if not ids.strip():
        return []
    wallet_ids = [wid.strip() for wid in ids.split(",") if wid.strip()]
    return await get_benefits_by_wallets(wallet_ids)
