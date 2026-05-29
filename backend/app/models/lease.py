import enum
import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Numeric, Boolean, Enum as SAEnum, DateTime, Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class BillingCycle(str, enum.Enum):
    monthly = "monthly"
    quarterly = "quarterly"
    annual = "annual"


class ContractStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    expired = "expired"
    terminated = "terminated"


class LeaseEventType(str, enum.Enum):
    delivery = "delivery"
    pickup = "pickup"
    swap = "swap"
    maintenance_call = "maintenance_call"
    damage_report = "damage_report"
    inspection = "inspection"


class DamageSeverity(str, enum.Enum):
    minor = "minor"
    moderate = "moderate"
    severe = "severe"


class LeaseContract(Base):
    __tablename__ = "lease_contracts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    equipment_id: Mapped[str] = mapped_column(String(36), ForeignKey("equipment.id", ondelete="RESTRICT"), nullable=False)
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    customer_email: Mapped[str] = mapped_column(String(200), nullable=False)
    customer_phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    service_address: Mapped[str] = mapped_column(String(500), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    monthly_rate: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    billing_cycle: Mapped[BillingCycle] = mapped_column(
        SAEnum(BillingCycle), nullable=False, default=BillingCycle.monthly
    )
    status: Mapped[ContractStatus] = mapped_column(
        SAEnum(ContractStatus), nullable=False, default=ContractStatus.pending
    )
    auto_renew: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    special_terms: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    equipment: Mapped["Equipment"] = relationship("Equipment", back_populates="contracts")  # noqa: F821
    events: Mapped[list["LeaseEvent"]] = relationship(
        "LeaseEvent", back_populates="contract", cascade="all, delete-orphan", order_by="LeaseEvent.scheduled_at"
    )
    damage_assessments: Mapped[list["DamageAssessment"]] = relationship(
        "DamageAssessment", back_populates="contract", cascade="all, delete-orphan"
    )


class LeaseEvent(Base):
    __tablename__ = "lease_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("lease_contracts.id", ondelete="CASCADE"), nullable=False
    )
    event_type: Mapped[LeaseEventType] = mapped_column(SAEnum(LeaseEventType), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    driver_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    contract: Mapped[LeaseContract] = relationship("LeaseContract", back_populates="events")


class DamageAssessment(Base):
    __tablename__ = "damage_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("lease_contracts.id", ondelete="CASCADE"), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[DamageSeverity] = mapped_column(SAEnum(DamageSeverity), nullable=False)
    repair_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    charged_to_customer: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    reported_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    contract: Mapped[LeaseContract] = relationship("LeaseContract", back_populates="damage_assessments")
