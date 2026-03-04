import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    auth,
    benefits,
    coupons,
    follows,
    notifications,
    reports,
    stores,
    users,
    wallets,
)

logger = logging.getLogger(__name__)

# Scheduler is optional - only runs when apscheduler is installed (i.e. in Docker)
_scheduler = None


def _start_scheduler():
    global _scheduler
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from app.tasks.background import (
            deactivate_expired_coupons,
            auto_resolve_reported_coupons,
        )

        _scheduler = BackgroundScheduler()
        _scheduler.add_job(deactivate_expired_coupons, "interval", hours=1, id="expire_coupons")
        _scheduler.add_job(auto_resolve_reported_coupons, "interval", hours=1, id="resolve_reports")
        _scheduler.start()
        logger.info("Background scheduler started")
    except ImportError:
        logger.warning("apscheduler not installed - background tasks disabled")


def _stop_scheduler():
    global _scheduler
    if _scheduler is not None:
        _scheduler.shutdown(wait=False)
        logger.info("Background scheduler stopped")
        _scheduler = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    _start_scheduler()
    yield
    _stop_scheduler()


app = FastAPI(
    title="DODO API",
    version="1.0.0",
    description="Backend API for the DODO coupon/benefit discovery app",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(stores.router, prefix="/api/stores", tags=["stores"])
app.include_router(benefits.router, prefix="/api/benefits", tags=["benefits"])
app.include_router(coupons.router, prefix="/api/coupons", tags=["coupons"])
app.include_router(wallets.router, prefix="/api/wallets", tags=["wallets"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(follows.router, prefix="/api/follows", tags=["follows"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
