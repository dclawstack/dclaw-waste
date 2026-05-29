import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, Enum as SAEnum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class EquipmentType(str, enum.Enum):
    roll_off = "roll_off"
    compactor = "compactor"
    baler = "baler"
    dumpster = "dumpster"
    cart = "cart"


class EquipmentStatus(str, enum.Enum):
    available = "available"
    deployed = "deployed"
    maintenance = "maintenance"
    retired = "retired"


class Equipment(Base):
    __tablename__ = "equipment"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    serial_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    equipment_type: Mapped[EquipmentType] = mapped_column(SAEnum(EquipmentType), nullable=False)
    capacity_yards: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[EquipmentStatus] = mapped_column(
        SAEnum(EquipmentStatus), nullable=False, default=EquipmentStatus.available
    )
    location_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    purchase_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    contracts: Mapped[list["LeaseContract"]] = relationship(  # noqa: F821
        "LeaseContract", back_populates="equipment", cascade="all, delete-orphan"
    )
