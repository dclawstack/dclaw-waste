import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Numeric, Boolean, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class VendorType(str, enum.Enum):
    hauler = "hauler"
    recycler = "recycler"
    processor = "processor"
    broker = "broker"


class Vendor(Base):
    __tablename__ = "vendors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    vendor_type: Mapped[VendorType] = mapped_column(SAEnum(VendorType), nullable=False)
    service_areas: Mapped[str] = mapped_column(Text, nullable=False, default="")
    accepted_waste_types: Mapped[str] = mapped_column(Text, nullable=False, default="")
    rate_per_ton: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    contact_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    performance_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=50.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
