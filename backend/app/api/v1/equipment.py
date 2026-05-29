import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.equipment import EquipmentStatus, EquipmentType
from app.repositories.equipment_repo import EquipmentRepository
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentRead, EquipmentList
from app.models.equipment import Equipment

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=EquipmentList)
async def list_equipment(
    status: EquipmentStatus | None = Query(None),
    equipment_type: EquipmentType | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = EquipmentRepository(db)
    items, total = await repo.list_filtered(status=status, equipment_type=equipment_type, limit=limit, offset=offset)
    return EquipmentList(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=EquipmentRead, status_code=201)
async def create_equipment(payload: EquipmentCreate, db: AsyncSession = Depends(get_db)):
    repo = EquipmentRepository(db)
    existing = await repo.get_by_serial(payload.serial_number)
    if existing:
        raise HTTPException(status_code=409, detail=f"Equipment with serial '{payload.serial_number}' already exists")
    equipment = Equipment(**payload.model_dump())
    return await repo.create(equipment)


@router.get("/availability", response_model=EquipmentList)
async def available_equipment(
    equipment_type: EquipmentType | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    repo = EquipmentRepository(db)
    items, total = await repo.list_filtered(status=EquipmentStatus.available, equipment_type=equipment_type, limit=100, offset=0)
    return EquipmentList(items=items, total=total, limit=100, offset=0)


@router.get("/{equipment_id}", response_model=EquipmentRead)
async def get_equipment(equipment_id: str, db: AsyncSession = Depends(get_db)):
    repo = EquipmentRepository(db)
    equipment = await repo.get_by_id(equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


@router.put("/{equipment_id}", response_model=EquipmentRead)
async def update_equipment(
    equipment_id: str, payload: EquipmentUpdate, db: AsyncSession = Depends(get_db)
):
    repo = EquipmentRepository(db)
    equipment = await repo.get_by_id(equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not data:
        return equipment
    return await repo.update(equipment, data)


@router.delete("/{equipment_id}", status_code=204)
async def delete_equipment(equipment_id: str, db: AsyncSession = Depends(get_db)):
    repo = EquipmentRepository(db)
    equipment = await repo.get_by_id(equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    await repo.delete(equipment)
