from datetime import datetime, date
from pydantic import BaseModel, ConfigDict
from app.models.schedule import JobType, TimeWindow, JobStatus


class CollectionJobCreate(BaseModel):
    site_id: str
    contract_id: str | None = None
    job_type: JobType
    scheduled_date: date
    time_window: TimeWindow = TimeWindow.anytime
    driver_notes: str | None = None


class CollectionJobUpdate(BaseModel):
    job_type: JobType | None = None
    scheduled_date: date | None = None
    time_window: TimeWindow | None = None
    status: JobStatus | None = None
    driver_notes: str | None = None
    completed_at: datetime | None = None


class CollectionJobRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    site_id: str
    contract_id: str | None
    job_type: JobType
    scheduled_date: date
    time_window: TimeWindow
    status: JobStatus
    driver_notes: str | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class CollectionJobList(BaseModel):
    items: list[CollectionJobRead]
    total: int
    limit: int
    offset: int
