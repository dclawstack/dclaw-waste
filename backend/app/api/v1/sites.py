import logging
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
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


# ── Predictive collection ─────────────────────────────────────────────────────

class SitePrediction(BaseModel):
    site_id: str
    avg_weekly_kg: float
    trend_direction: str          # "increasing" | "stable" | "decreasing"
    trend_pct_change: float       # % change between first and second half of window
    suggested_next_collection: str  # ISO date
    confidence: str               # "high" | "medium" | "low"
    reasoning: str


@router.get("/{site_id}/predict", response_model=SitePrediction)
async def predict_collection(site_id: str, db: AsyncSession = Depends(get_db)):
    repo = SiteRepository(db)
    site = await repo.get_by_id(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    from app.repositories.waste_repo import WasteRecordRepository
    waste_repo = WasteRecordRepository(db)
    records, _ = await waste_repo.list_filtered(site_id=site_id, limit=200, offset=0)

    if len(records) < 3:
        return SitePrediction(
            site_id=site_id,
            avg_weekly_kg=0.0,
            trend_direction="stable",
            trend_pct_change=0.0,
            suggested_next_collection=(date.today() + timedelta(days=7)).isoformat(),
            confidence="low",
            reasoning="Insufficient data — fewer than 3 records. Schedule weekly collection as default.",
        )

    # Sort by date ascending
    sorted_records = sorted(records, key=lambda r: r.recorded_at)
    weights = [float(r.weight_kg) for r in sorted_records]

    # Split into halves to detect trend
    mid = len(weights) // 2
    first_avg = sum(weights[:mid]) / mid if mid > 0 else 0
    second_avg = sum(weights[mid:]) / len(weights[mid:]) if len(weights[mid:]) > 0 else 0
    total_avg = sum(weights) / len(weights)

    # Weekly rate (approximate: assume records span ~30 days)
    days_span = max((sorted_records[-1].recorded_at - sorted_records[0].recorded_at).days, 1)
    weekly_rate = round(total_avg * 7 / max(days_span / len(weights), 1), 1)

    # Trend detection
    if first_avg > 0:
        pct_change = round((second_avg - first_avg) / first_avg * 100, 1)
    else:
        pct_change = 0.0

    if pct_change > 15:
        direction, confidence = "increasing", "high"
        days_to_collection = 5  # more frequent collection needed
    elif pct_change < -15:
        direction, confidence = "decreasing", "medium"
        days_to_collection = 10
    else:
        direction, confidence = "stable", "high"
        days_to_collection = 7

    next_collection = date.today() + timedelta(days=days_to_collection)

    reasoning = (
        f"Based on {len(records)} records over ~{days_span} days. "
        f"Average waste: {round(total_avg, 1)} kg/record, weekly rate ~{weekly_rate} kg. "
        f"Trend: {direction} ({pct_change:+.1f}% change between periods)."
    )

    return SitePrediction(
        site_id=site_id,
        avg_weekly_kg=weekly_rate,
        trend_direction=direction,
        trend_pct_change=pct_change,
        suggested_next_collection=next_collection.isoformat(),
        confidence=confidence,
        reasoning=reasoning,
    )
