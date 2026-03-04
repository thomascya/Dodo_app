from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_auth
from app.models.schemas import CouponCreate
from app.services.coupon_service import (
    create_coupon,
    delete_coupon,
    get_coupons_by_following,
    get_coupons_by_store,
    is_user_influencer,
    update_coupon,
)

router = APIRouter()


@router.get("/store/{store_id}")
async def coupons_by_store(store_id: str):
    return await get_coupons_by_store(store_id)


@router.get("/following")
async def coupons_following(current_user: dict = Depends(require_auth)):
    return await get_coupons_by_following(current_user["id"])


@router.post("/", status_code=201)
async def create(body: CouponCreate, current_user: dict = Depends(require_auth)):
    if not await is_user_influencer(current_user["id"]):
        raise HTTPException(status_code=403, detail="Only verified influencers can create coupons")
    result = await create_coupon(current_user["id"], body.model_dump(mode="json"))
    return result


@router.put("/{coupon_id}")
async def update(coupon_id: str, body: CouponCreate, current_user: dict = Depends(require_auth)):
    result = await update_coupon(coupon_id, current_user["id"], body.model_dump(mode="json"))
    if result is None:
        raise HTTPException(status_code=404, detail="Coupon not found or not owned by you")
    return result


@router.delete("/{coupon_id}")
async def delete(coupon_id: str, current_user: dict = Depends(require_auth)):
    success = await delete_coupon(coupon_id, current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Coupon not found or not owned by you")
    return {"status": "ok"}
