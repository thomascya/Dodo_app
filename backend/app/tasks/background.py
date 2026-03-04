"""Background tasks for the DODO app.

- deactivate_expired_coupons: runs every hour, sets is_active=False on expired coupons
- auto_resolve_reported_coupons: runs every hour, deactivates coupons with 3+ pending reports
"""

import logging
from datetime import datetime, timezone

from app.services.supabase_client import get_supabase

logger = logging.getLogger(__name__)

REPORT_THRESHOLD = 3


def deactivate_expired_coupons() -> int:
    """Set is_active=False for coupons past their expires_at. Returns count updated."""
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    result = (
        sb.table("coupons")
        .update({"is_active": False})
        .eq("is_active", True)
        .lt("expires_at", now)
        .execute()
    )
    count = len(result.data) if result.data else 0
    if count:
        logger.info("Deactivated %d expired coupons", count)
    return count


def auto_resolve_reported_coupons() -> int:
    """Deactivate coupons with >= REPORT_THRESHOLD pending reports and resolve reports."""
    sb = get_supabase()

    # Get pending reports grouped by coupon
    pending_reports = (
        sb.table("reports")
        .select("id, coupon_id")
        .eq("status", "pending")
        .execute()
    )
    if not pending_reports.data:
        return 0

    # Count reports per coupon
    coupon_counts: dict[str, list[str]] = {}
    for report in pending_reports.data:
        cid = report["coupon_id"]
        coupon_counts.setdefault(cid, []).append(report["id"])

    resolved_count = 0
    for coupon_id, report_ids in coupon_counts.items():
        if len(report_ids) >= REPORT_THRESHOLD:
            # Deactivate the coupon
            sb.table("coupons").update({"is_active": False}).eq("id", coupon_id).execute()
            # Mark all its pending reports as resolved
            for rid in report_ids:
                sb.table("reports").update({"status": "resolved"}).eq("id", rid).execute()
            resolved_count += 1
            logger.info(
                "Auto-resolved coupon %s with %d reports", coupon_id, len(report_ids)
            )

    return resolved_count
