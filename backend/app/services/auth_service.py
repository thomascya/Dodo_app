from app.services.supabase_client import get_supabase


async def sign_up_with_email(email: str, password: str) -> dict:
    """Register a new user with email + password via Supabase Auth."""
    sb = get_supabase()
    result = sb.auth.sign_up({"email": email, "password": password})
    if result.user is None:
        raise ValueError("Sign up failed")
    return _format_session(result)


async def sign_in_with_email(email: str, password: str) -> dict:
    """Sign in with email + password via Supabase Auth."""
    sb = get_supabase()
    result = sb.auth.sign_in_with_password({"email": email, "password": password})
    return _format_session(result)


async def sign_in_with_social(provider: str, id_token: str) -> dict:
    """Sign in with social provider (Google) via Supabase Auth."""
    sb = get_supabase()
    result = sb.auth.sign_in_with_id_token(
        {"provider": provider, "token": id_token}
    )
    return _format_session(result)


async def sign_in_as_guest() -> dict:
    """Create an anonymous guest session via Supabase Auth."""
    sb = get_supabase()
    result = sb.auth.sign_in_anonymously()
    return _format_session(result)


async def refresh_session(refresh_token: str) -> dict:
    """Refresh an expired access token."""
    sb = get_supabase()
    result = sb.auth.refresh_session(refresh_token)
    return _format_session(result)


async def sign_out(access_token: str) -> None:
    """Sign out (revoke session on Supabase side)."""
    sb = get_supabase()
    sb.auth.admin.sign_out(access_token)


async def get_user_profile(user_id: str) -> dict | None:
    """Fetch user profile from the users table."""
    sb = get_supabase()
    result = sb.table("users").select("*").eq("id", user_id).maybe_single().execute()
    return result.data


async def ensure_user_record(user_id: str, email: str) -> dict:
    """Create or fetch user record in the users table.

    Supabase Auth creates an auth.users entry, but we also need
    a record in our public.users table for app data.
    """
    sb = get_supabase()
    existing = sb.table("users").select("*").eq("id", user_id).maybe_single().execute()
    if existing.data:
        return existing.data

    result = sb.table("users").insert({
        "id": user_id,
        "email": email,
        "is_influencer": False,
        "is_verified": False,
    }).execute()
    return result.data[0]


def _format_session(result) -> dict:
    """Extract tokens and user info from Supabase auth response."""
    session = result.session
    user = result.user
    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "user_id": user.id,
        "email": user.email or "",
    }
