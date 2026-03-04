from fastapi import APIRouter, HTTPException, Query

from app.services.store_service import get_store_by_id, get_stores, search_stores

router = APIRouter()


@router.get("/")
async def list_stores():
    return await get_stores()


@router.get("/search")
async def search(q: str = Query("", min_length=0)):
    return await search_stores(q)


@router.get("/{store_id}")
async def get_store(store_id: str):
    store = await get_store_by_id(store_id)
    if store is None:
        raise HTTPException(status_code=404, detail="Store not found")
    return store
