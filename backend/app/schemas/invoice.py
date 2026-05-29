from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.invoice import InvoiceStatus


class InvoiceCreate(BaseModel):
    contract_id: str
    period_start: date
    period_end: date
    base_amount: float
    damage_charges: float = 0.0
    due_date: date
    notes: str | None = None

    @field_validator("base_amount", "damage_charges")
    @classmethod
    def non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Amount cannot be negative")
        return v


class InvoiceUpdate(BaseModel):
    status: InvoiceStatus | None = None
    notes: str | None = None
    damage_charges: float | None = None


class InvoiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    contract_id: str
    period_start: date
    period_end: date
    base_amount: float
    damage_charges: float
    total: float
    status: InvoiceStatus
    due_date: date
    notes: str | None
    created_at: datetime


class InvoiceList(BaseModel):
    items: list[InvoiceRead]
    total: int
    limit: int
    offset: int
