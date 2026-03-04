from __future__ import annotations

from typing import TYPE_CHECKING

from app.config import settings

if TYPE_CHECKING:
    from supabase import Client

_client: Client | None = None


def get_supabase() -> Client:
    """Get the Supabase client (lazy singleton).

    Uses the service_role key which bypasses RLS.
    Authorization is enforced in Python code instead.
    """
    global _client
    if _client is None:
        from supabase import create_client

        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return _client
