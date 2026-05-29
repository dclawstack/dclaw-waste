import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.vendor import Vendor, VendorType
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorRead, VendorList

logger = logging.getLogger(__name__)
router = APIRouter()


async def _get_or_404(vid: str, db: AsyncSession) -> Vendor:
    result = await db.execute(select(Vendor).where(Vendor.id == vid))
    v = result.scalar_one_or_none()
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return v


@router.get("/", response_model=VendorList)
async def list_vendors(
    vendor_type: VendorType | None = Query(None),
    active_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    q = select(Vendor)
    cq = select(func.count()).select_from(Vendor)
    if vendor_type:
        q = q.where(Vendor.vendor_type == vendor_type)
        cq = cq.where(Vendor.vendor_type == vendor_type)
    if active_only:
        q = q.where(Vendor.active == True)  # noqa: E712
        cq = cq.where(Vendor.active == True)  # noqa: E712
    items = list((await db.execute(q.order_by(Vendor.name).limit(limit).offset(offset))).scalars().all())
    total = (await db.execute(cq)).scalar() or 0
    return VendorList(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=VendorRead, status_code=201)
async def create_vendor(payload: VendorCreate, db: AsyncSession = Depends(get_db)):
    from app.models.vendor import Vendor as V
    import uuid
    v = V(id=str(uuid.uuid4()), **payload.model_dump())
    db.add(v)
    await db.commit()
    await db.refresh(v)
    return v


@router.get("/{vendor_id}", response_model=VendorRead)
async def get_vendor(vendor_id: str, db: AsyncSession = Depends(get_db)):
    return await _get_or_404(vendor_id, db)


@router.put("/{vendor_id}", response_model=VendorRead)
async def update_vendor(vendor_id: str, payload: VendorUpdate, db: AsyncSession = Depends(get_db)):
    v = await _get_or_404(vendor_id, db)
    for k, val in payload.model_dump().items():
        if val is not None:
            setattr(v, k, val)
    await db.commit()
    await db.refresh(v)
    return v


@router.delete("/{vendor_id}", status_code=204)
async def delete_vendor(vendor_id: str, db: AsyncSession = Depends(get_db)):
    v = await _get_or_404(vendor_id, db)
    await db.delete(v)
    await db.commit()
