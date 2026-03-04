from fastapi import APIRouter, Depends

from app.middleware.auth import require_auth
from app.models.schemas import ReportCreate
from app.services.report_service import create_report

router = APIRouter()


@router.post("/")
async def submit_report(body: ReportCreate, current_user: dict = Depends(require_auth)):
    result = await create_report(
        user_id=current_user["id"],
        coupon_id=body.coupon_id,
        reason=body.reason.value,
        details=body.details,
    )
    return result
