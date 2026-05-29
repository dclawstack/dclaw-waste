from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.waste import SiteType, WasteType, DiversionMethod


class SiteCreate(BaseModel):
    name: str
    address: str
    site_type: SiteType
    customer_name: str
    active: bool = True

    @field_validator("name", "address", "customer_name")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be blank")
        return v.strip()


class SiteUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    site_type: SiteType | None = None
    customer_name: str | None = None
    active: bool | None = None


class SiteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    address: str
    site_type: SiteType
    customer_name: str
    active: bool
    created_at: datetime
    updated_at: datetime


class SiteList(BaseModel):
    items: list[SiteRead]
    total: int
    limit: int
    offset: int


class WasteRecordCreate(BaseModel):
    site_id: str
    waste_type: WasteType
    weight_kg: float
    volume_liters: float | None = None
    diversion_method: DiversionMethod
    notes: str | None = None
    recorded_at: datetime | None = None

    @field_validator("weight_kg")
    @classmethod
    def weight_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("weight_kg must be greater than zero")
        return v


class WasteRecordUpdate(BaseModel):
    waste_type: WasteType | None = None
    weight_kg: float | None = None
    volume_liters: float | None = None
    diversion_method: DiversionMethod | None = None
    notes: str | None = None


class WasteRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    site_id: str
    waste_type: WasteType
    weight_kg: float
    volume_liters: float | None
    diversion_method: DiversionMethod
    notes: str | None
    recorded_at: datetime
    created_at: datetime


class WasteRecordList(BaseModel):
    items: list[WasteRecordRead]
    total: int
    limit: int
    offset: int


class WasteSummary(BaseModel):
    total_weight_kg: float
    by_type: dict[str, float]
    by_diversion: dict[str, float]
    diversion_rate_pct: float
