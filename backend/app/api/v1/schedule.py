import logging
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel as _PydanticBase
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.schedule import CollectionJob, JobStatus
from app.repositories.schedule_repo import ScheduleRepository
from app.repositories.waste_repo import SiteRepository
from app.schemas.schedule import CollectionJobCreate, CollectionJobUpdate, CollectionJobRead, CollectionJobList

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=CollectionJobList)
async def list_jobs(
    scheduled_date: date | None = Query(None),
    status: JobStatus | None = Query(None),
    site_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = ScheduleRepository(db)
    items, total = await repo.list_filtered(
        scheduled_date=scheduled_date, status=status, site_id=site_id, limit=limit, offset=offset
    )
    return CollectionJobList(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=CollectionJobRead, status_code=201)
async def create_job(payload: CollectionJobCreate, db: AsyncSession = Depends(get_db)):
    site_repo = SiteRepository(db)
    site = await site_repo.get_by_id(payload.site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    job = CollectionJob(**payload.model_dump())
    repo = ScheduleRepository(db)
    return await repo.create(job)


@router.get("/today", response_model=CollectionJobList)
async def jobs_today(db: AsyncSession = Depends(get_db)):
    repo = ScheduleRepository(db)
    items, total = await repo.list_filtered(scheduled_date=date.today(), limit=200, offset=0)
    return CollectionJobList(items=items, total=total, limit=200, offset=0)


@router.get("/{job_id}", response_model=CollectionJobRead)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    repo = ScheduleRepository(db)
    job = await repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Collection job not found")
    return job


@router.put("/{job_id}", response_model=CollectionJobRead)
async def update_job(job_id: str, payload: CollectionJobUpdate, db: AsyncSession = Depends(get_db)):
    repo = ScheduleRepository(db)
    job = await repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Collection job not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not data:
        return job
    return await repo.update(job, data)


@router.post("/{job_id}/complete", response_model=CollectionJobRead)
async def complete_job(job_id: str, db: AsyncSession = Depends(get_db)):
    repo = ScheduleRepository(db)
    job = await repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Collection job not found")
    return await repo.update(job, {"status": JobStatus.completed, "completed_at": datetime.utcnow()})


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str, db: AsyncSession = Depends(get_db)):
    repo = ScheduleRepository(db)
    job = await repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Collection job not found")
    await repo.delete(job)


# ── Route optimizer ──────────────────────────────────────────────────────────

class StopInput(_PydanticBase):
    job_id: str
    lat: float
    lng: float


class RouteResult(_PydanticBase):
    ordered_job_ids: list[str]
    stop_count: int


@router.post("/optimize-route", response_model=RouteResult)
async def optimize_route(stops: list[StopInput]):
    from app.services.route_optimizer import Stop, optimize_route as _opt
    result = _opt([Stop(s.job_id, s.lat, s.lng) for s in stops])
    return RouteResult(ordered_job_ids=result, stop_count=len(result))
