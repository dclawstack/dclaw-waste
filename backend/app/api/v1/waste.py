import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.waste import WasteRecord, DiversionMethod
from app.repositories.waste_repo import WasteRecordRepository, SiteRepository
from app.schemas.waste import WasteRecordCreate, WasteRecordUpdate, WasteRecordRead, WasteRecordList, WasteSummary

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=WasteRecordList)
async def list_waste_records(
    site_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = WasteRecordRepository(db)
    items, total = await repo.list_filtered(site_id=site_id, limit=limit, offset=offset)
    return WasteRecordList(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=WasteRecordRead, status_code=201)
async def create_waste_record(payload: WasteRecordCreate, db: AsyncSession = Depends(get_db)):
    site_repo = SiteRepository(db)
    site = await site_repo.get_by_id(payload.site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    data = payload.model_dump()
    if data.get("recorded_at") is None:
        data.pop("recorded_at")
    record = WasteRecord(**data)
    repo = WasteRecordRepository(db)
    return await repo.create(record)


@router.get("/summary", response_model=WasteSummary)
async def waste_summary(
    site_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    repo = WasteRecordRepository(db)
    rows = await repo.summary(site_id=site_id)

    by_type: dict[str, float] = {}
    by_diversion: dict[str, float] = {}
    total_kg = 0.0
    diverted_kg = 0.0

    for row in rows:
        kg = float(row.total_kg or 0)
        by_type[row.waste_type] = by_type.get(row.waste_type, 0) + kg
        by_diversion[row.diversion_method] = by_diversion.get(row.diversion_method, 0) + kg
        total_kg += kg
        if row.diversion_method != DiversionMethod.landfill:
            diverted_kg += kg

    diversion_rate = round((diverted_kg / total_kg * 100), 1) if total_kg > 0 else 0.0
    return WasteSummary(
        total_weight_kg=round(total_kg, 3),
        by_type=by_type,
        by_diversion=by_diversion,
        diversion_rate_pct=diversion_rate,
    )


@router.get("/{record_id}", response_model=WasteRecordRead)
async def get_waste_record(record_id: str, db: AsyncSession = Depends(get_db)):
    repo = WasteRecordRepository(db)
    record = await repo.get_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Waste record not found")
    return record


@router.put("/{record_id}", response_model=WasteRecordRead)
async def update_waste_record(
    record_id: str, payload: WasteRecordUpdate, db: AsyncSession = Depends(get_db)
):
    repo = WasteRecordRepository(db)
    record = await repo.get_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Waste record not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    return await repo.update(record, data)


@router.delete("/{record_id}", status_code=204)
async def delete_waste_record(record_id: str, db: AsyncSession = Depends(get_db)):
    repo = WasteRecordRepository(db)
    record = await repo.get_by_id(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Waste record not found")
    await repo.delete(record)
