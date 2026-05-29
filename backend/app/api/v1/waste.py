import csv
import io
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.waste import WasteRecord, DiversionMethod, WasteType
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


# ── CSV export ───────────────────────────────────────────────────────────────

@router.get("/export/csv")
async def export_waste_csv(site_id: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    repo = WasteRecordRepository(db)
    items, _ = await repo.list_filtered(site_id=site_id, limit=10000, offset=0)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "site_id", "waste_type", "weight_kg", "volume_liters", "diversion_method", "notes", "recorded_at"])
    for r in items:
        writer.writerow([r.id, r.site_id, r.waste_type, r.weight_kg, r.volume_liters, r.diversion_method, r.notes, r.recorded_at])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=waste_records.csv"})


# ── AI Waste Classifier ──────────────────────────────────────────────────────

class ClassifyRequest(BaseModel):
    description: str


class ClassifyResult(BaseModel):
    waste_type: str
    diversion_method: str
    confidence: str
    reasoning: str


_KEYWORD_MAP: list[tuple[list[str], str, str]] = [
    (["cardboard", "paper", "plastic", "glass", "metal", "alumin", "tin", "bottle", "can", "recycl"], "recyclable", "recycle"),
    (["food", "organic", "compost", "fruit", "vegetable", "plant", "garden", "green waste", "leftovers"], "organic", "compost"),
    (["battery", "chemical", "paint", "solvent", "acid", "toxic", "hazard", "medical", "pharmaceut"], "hazardous", "incinerate"),
    (["computer", "phone", "electronic", "e-waste", "circuit", "tv", "monitor", "cable", "device"], "e_waste", "recycle"),
    (["concrete", "brick", "wood", "lumber", "drywall", "debris", "construction", "demolition", "rubble"], "construction", "reuse"),
]


@router.post("/classify", response_model=ClassifyResult)
async def classify_waste(payload: ClassifyRequest):
    desc = payload.description.lower()
    for keywords, wtype, method in _KEYWORD_MAP:
        matched = [kw for kw in keywords if kw in desc]
        if matched:
            return ClassifyResult(
                waste_type=wtype, diversion_method=method,
                confidence="high" if len(matched) >= 2 else "medium",
                reasoning=f"Matched keywords: {', '.join(matched)}",
            )
    return ClassifyResult(
        waste_type="general", diversion_method="landfill",
        confidence="low",
        reasoning="No specific keywords matched — defaulting to general waste.",
    )


# ── Anomaly Detection ────────────────────────────────────────────────────────

class AnomalyRecord(BaseModel):
    record_id: str
    site_id: str
    waste_type: str
    weight_kg: float
    mean_kg: float
    std_dev_kg: float
    z_score: float
    recorded_at: str


@router.get("/anomalies", response_model=list[AnomalyRecord])
async def detect_anomalies(site_id: str | None = Query(None), db: AsyncSession = Depends(get_db)):
    import statistics
    repo = WasteRecordRepository(db)
    items, _ = await repo.list_filtered(site_id=site_id, limit=1000, offset=0)

    # Group by (site_id, waste_type)
    groups: dict[tuple[str, str], list] = {}
    for r in items:
        key = (r.site_id, str(r.waste_type))
        groups.setdefault(key, []).append(r)

    anomalies: list[AnomalyRecord] = []
    for (sid, wtype), records in groups.items():
        if len(records) < 5:
            continue
        weights = [float(r.weight_kg) for r in records]
        mean = statistics.mean(weights)
        std = statistics.stdev(weights) if len(weights) > 1 else 0
        if std == 0:
            continue
        for r in records:
            z = (float(r.weight_kg) - mean) / std
            if z > 2.0:
                anomalies.append(AnomalyRecord(
                    record_id=r.id, site_id=r.site_id, waste_type=str(r.waste_type),
                    weight_kg=float(r.weight_kg), mean_kg=round(mean, 2),
                    std_dev_kg=round(std, 2), z_score=round(z, 2),
                    recorded_at=str(r.recorded_at),
                ))

    return sorted(anomalies, key=lambda x: x.z_score, reverse=True)
