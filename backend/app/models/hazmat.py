import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Numeric, Enum as SAEnum, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class HazmatStatus(str, enum.Enum):
    pending = "pending"
    manifested = "manifested"
    disposed = "disposed"
    verified = "verified"


class HazmatRecord(Base):
    __tablename__ = "hazmat_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    waste_type_detail: Mapped[str] = mapped_column(String(300), nullable=False)
    un_number: Mapped[str] = mapped_column(String(20), nullable=False)
    hazard_class: Mapped[str] = mapped_column(String(50), nullable=False)
    quantity_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    manifest_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    disposal_vendor_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[HazmatStatus] = mapped_column(
        SAEnum(HazmatStatus), nullable=False, default=HazmatStatus.pending
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
