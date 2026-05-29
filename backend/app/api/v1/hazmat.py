import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.hazmat import HazmatRecord, HazmatStatus
from app.models.waste import Site
from app.schemas.hazmat import HazmatCreate, HazmatUpdate, HazmatRead, HazmatList

logger = logging.getLogger(__name__)
router = APIRouter()


async def _get_or_404(hid: str, db: AsyncSession) -> HazmatRecord:
    result = await db.execute(select(HazmatRecord).where(HazmatRecord.id == hid))
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Hazmat record not found")
    return rec


@router.get("/", response_model=HazmatList)
async def list_hazmat(
    site_id: str | None = Query(None),
    status: HazmatStatus | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    q = select(HazmatRecord)
    cq = select(func.count()).select_from(HazmatRecord)
    if site_id:
        q = q.where(HazmatRecord.site_id == site_id)
        cq = cq.where(HazmatRecord.site_id == site_id)
    if status:
        q = q.where(HazmatRecord.status == status)
        cq = cq.where(HazmatRecord.status == status)
    items = list((await db.execute(q.order_by(HazmatRecord.recorded_at.desc()).limit(limit).offset(offset))).scalars().all())
    total = (await db.execute(cq)).scalar() or 0
    return HazmatList(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=HazmatRead, status_code=201)
async def create_hazmat(payload: HazmatCreate, db: AsyncSession = Depends(get_db)):
    site = (await db.execute(select(Site).where(Site.id == payload.site_id))).scalar_one_or_none()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    rec = HazmatRecord(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    return rec


@router.get("/{hazmat_id}", response_model=HazmatRead)
async def get_hazmat(hazmat_id: str, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(hazmat_id, db)


@router.put("/{hazmat_id}", response_model=HazmatRead)
async def update_hazmat(hazmat_id: str, payload: HazmatUpdate, db: AsyncSession = Depends(get_db)):
    rec = await _get_or_404(hazmat_id, db)
    for k, v in payload.model_dump().items():
        if v is not None:
            setattr(rec, k, v)
    await db.commit()
    await db.refresh(rec)
    return rec


@router.delete("/{hazmat_id}", status_code=204)
async def delete_hazmat(hazmat_id: str, db: AsyncSession = Depends(get_db)):
    rec = await _get_or_404(hazmat_id, db)
    await db.delete(rec)
    await db.commit()
