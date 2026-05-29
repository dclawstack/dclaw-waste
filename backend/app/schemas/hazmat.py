from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.hazmat import HazmatStatus


class HazmatCreate(BaseModel):
    site_id: str
    waste_type_detail: str
    un_number: str
    hazard_class: str
    quantity_kg: float
    manifest_number: str | None = None
    disposal_vendor_id: str | None = None
    notes: str | None = None

    @field_validator("quantity_kg")
    @classmethod
    def qty_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("quantity_kg must be positive")
        return v

    @field_validator("un_number")
    @classmethod
    def un_format(cls, v: str) -> str:
        v = v.strip().upper()
        if not v.startswith("UN"):
            v = "UN" + v
        return v


class HazmatUpdate(BaseModel):
    manifest_number: str | None = None
    disposal_vendor_id: str | None = None
    status: HazmatStatus | None = None
    notes: str | None = None


class HazmatRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    site_id: str
    waste_type_detail: str
    un_number: str
    hazard_class: str
    quantity_kg: float
    manifest_number: str | None
    disposal_vendor_id: str | None
    status: HazmatStatus
    notes: str | None
    recorded_at: datetime
    created_at: datetime


class HazmatList(BaseModel):
    items: list[HazmatRead]
    total: int
    limit: int
    offset: int
