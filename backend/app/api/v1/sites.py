import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.waste import Site
from app.repositories.waste_repo import SiteRepository
from app.schemas.waste import SiteCreate, SiteUpdate, SiteRead, SiteList

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=SiteList)
async def list_sites(
    active_only: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = SiteRepository(db)
    items, total = await repo.list_filtered(active_only=active_only, limit=limit, offset=offset)
    return SiteList(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=SiteRead, status_code=201)
async def create_site(payload: SiteCreate, db: AsyncSession = Depends(get_db)):
    repo = SiteRepository(db)
    site = Site(**payload.model_dump())
    return await repo.create(site)


@router.get("/{site_id}", response_model=SiteRead)
async def get_site(site_id: str, db: AsyncSession = Depends(get_db)):
    repo = SiteRepository(db)
    site = await repo.get_by_id(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site


@router.put("/{site_id}", response_model=SiteRead)
async def update_site(site_id: str, payload: SiteUpdate, db: AsyncSession = Depends(get_db)):
    repo = SiteRepository(db)
    site = await repo.get_by_id(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not data:
        return site
    return await repo.update(site, data)


@router.delete("/{site_id}", status_code=204)
async def delete_site(site_id: str, db: AsyncSession = Depends(get_db)):
    repo = SiteRepository(db)
    site = await repo.get_by_id(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    await repo.delete(site)
