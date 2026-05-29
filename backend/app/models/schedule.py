import enum
import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Enum as SAEnum, DateTime, Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class JobType(str, enum.Enum):
    regular_collection = "regular_collection"
    delivery = "delivery"
    swap = "swap"
    pickup = "pickup"
    emergency = "emergency"


class TimeWindow(str, enum.Enum):
    morning = "morning"
    afternoon = "afternoon"
    anytime = "anytime"


class JobStatus(str, enum.Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class CollectionJob(Base):
    __tablename__ = "collection_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    contract_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("lease_contracts.id", ondelete="SET NULL"), nullable=True
    )
    job_type: Mapped[JobType] = mapped_column(SAEnum(JobType), nullable=False)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    time_window: Mapped[TimeWindow] = mapped_column(
        SAEnum(TimeWindow), nullable=False, default=TimeWindow.anytime
    )
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus), nullable=False, default=JobStatus.scheduled
    )
    driver_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    site: Mapped["Site"] = relationship("Site", back_populates="collection_jobs")  # noqa: F821
    contract: Mapped["LeaseContract | None"] = relationship("LeaseContract")  # noqa: F821
