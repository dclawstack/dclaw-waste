import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Numeric, Boolean, Enum as SAEnum, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class SiteType(str, enum.Enum):
    office = "office"
    warehouse = "warehouse"
    restaurant = "restaurant"
    retail = "retail"
    construction = "construction"
    industrial = "industrial"


class WasteType(str, enum.Enum):
    general = "general"
    recyclable = "recyclable"
    organic = "organic"
    hazardous = "hazardous"
    e_waste = "e_waste"
    construction = "construction"


class DiversionMethod(str, enum.Enum):
    landfill = "landfill"
    recycle = "recycle"
    compost = "compost"
    incinerate = "incinerate"
    reuse = "reuse"
    donate = "donate"


class Site(Base):
    __tablename__ = "sites"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    site_type: Mapped[SiteType] = mapped_column(SAEnum(SiteType), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    waste_records: Mapped[list["WasteRecord"]] = relationship(
        "WasteRecord", back_populates="site", cascade="all, delete-orphan"
    )
    collection_jobs: Mapped[list["CollectionJob"]] = relationship(  # noqa: F821
        "CollectionJob", back_populates="site", cascade="all, delete-orphan"
    )


class WasteRecord(Base):
    __tablename__ = "waste_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    site_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False
    )
    waste_type: Mapped[WasteType] = mapped_column(SAEnum(WasteType), nullable=False)
    weight_kg: Mapped[float] = mapped_column(Numeric(10, 3), nullable=False)
    volume_liters: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    diversion_method: Mapped[DiversionMethod] = mapped_column(SAEnum(DiversionMethod), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    site: Mapped[Site] = relationship("Site", back_populates="waste_records")
