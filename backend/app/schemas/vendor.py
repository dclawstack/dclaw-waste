from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.vendor import VendorType


class VendorCreate(BaseModel):
    name: str
    vendor_type: VendorType
    service_areas: str = ""
    accepted_waste_types: str = ""
    rate_per_ton: float | None = None
    contact_name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("name cannot be blank")
        return v.strip()


class VendorUpdate(BaseModel):
    name: str | None = None
    vendor_type: VendorType | None = None
    service_areas: str | None = None
    accepted_waste_types: str | None = None
    rate_per_ton: float | None = None
    contact_name: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    active: bool | None = None
    performance_score: float | None = None


class VendorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    vendor_type: VendorType
    service_areas: str
    accepted_waste_types: str
    rate_per_ton: float | None
    contact_name: str | None
    contact_email: str | None
    contact_phone: str | None
    active: bool
    performance_score: float
    created_at: datetime
    updated_at: datetime


class VendorList(BaseModel):
    items: list[VendorRead]
    total: int
    limit: int
    offset: int
