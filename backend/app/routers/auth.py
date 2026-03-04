from fastapi import APIRouter, Depends, HTTPException

from app.middleware.auth import require_auth
from app.models.schemas import (
    EmailPasswordAuth,
    RefreshTokenRequest,
    SocialAuth,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import (
    ensure_user_record,
    get_user_profile,
    refresh_session,
    sign_in_as_guest,
    sign_in_with_email,
    sign_in_with_social,
    sign_out,
    sign_up_with_email,
)

router = APIRouter()


async def _build_token_response(session: dict) -> dict:
    """Build a TokenResponse from auth session + user profile."""
    user_profile = await ensure_user_record(session["user_id"], session["email"])
    return {
        "access_token": session["access_token"],
        "refresh_token": session["refresh_token"],
        "user": user_profile,
    }


@router.post("/signup/email")
async def signup_email(body: EmailPasswordAuth):
    try:
        session = await sign_up_with_email(body.email, body.password)
        return await _build_token_response(session)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin/email")
async def signin_email(body: EmailPasswordAuth):
    try:
        session = await sign_in_with_email(body.email, body.password)
        return await _build_token_response(session)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/signin/social")
async def signin_social(body: SocialAuth):
    try:
        session = await sign_in_with_social(body.provider, body.id_token)
        return await _build_token_response(session)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/guest")
async def signin_guest():
    try:
        session = await sign_in_as_guest()
        return await _build_token_response(session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/signout")
async def signout(current_user: dict = Depends(require_auth)):
    try:
        await sign_out(current_user["id"])
    except Exception:
        pass  # Best-effort sign out
    return {"status": "ok"}


@router.post("/refresh")
async def refresh(body: RefreshTokenRequest):
    try:
        session = await refresh_session(body.refresh_token)
        return await _build_token_response(session)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
async def get_me(current_user: dict = Depends(require_auth)):
    profile = await get_user_profile(current_user["id"])
    if profile is None:
        raise HTTPException(status_code=404, detail="User profile not found")
    return profile
