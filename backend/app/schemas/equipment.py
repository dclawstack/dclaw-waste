from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator
from app.models.equipment import EquipmentType, EquipmentStatus


class EquipmentCreate(BaseModel):
    serial_number: str
    equipment_type: EquipmentType
    capacity_yards: int | None = None
    status: EquipmentStatus = EquipmentStatus.available
    location_address: str | None = None
    purchase_date: str | None = None
    notes: str | None = None

    @field_validator("serial_number")
    @classmethod
    def serial_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("serial_number cannot be blank")
        return v.strip()


class EquipmentUpdate(BaseModel):
    serial_number: str | None = None
    equipment_type: EquipmentType | None = None
    capacity_yards: int | None = None
    status: EquipmentStatus | None = None
    location_address: str | None = None
    purchase_date: str | None = None
    notes: str | None = None


class EquipmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    serial_number: str
    equipment_type: EquipmentType
    capacity_yards: int | None
    status: EquipmentStatus
    location_address: str | None
    purchase_date: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime


class EquipmentList(BaseModel):
    items: list[EquipmentRead]
    total: int
    limit: int
    offset: int
