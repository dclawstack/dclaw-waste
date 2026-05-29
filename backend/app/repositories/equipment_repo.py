from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.equipment import Equipment, EquipmentStatus, EquipmentType
from app.repositories.base_repo import BaseRepository


class EquipmentRepository(BaseRepository[Equipment]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Equipment)

    async def get_by_serial(self, serial_number: str) -> Equipment | None:
        result = await self.db.execute(
            select(Equipment).where(Equipment.serial_number == serial_number)
        )
        return result.scalar_one_or_none()

    async def list_filtered(
        self,
        status: EquipmentStatus | None = None,
        equipment_type: EquipmentType | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Equipment], int]:
        query = select(Equipment)
        count_query = select(func.count()).select_from(Equipment)

        if status:
            query = query.where(Equipment.status == status)
            count_query = count_query.where(Equipment.status == status)
        if equipment_type:
            query = query.where(Equipment.equipment_type == equipment_type)
            count_query = count_query.where(Equipment.equipment_type == equipment_type)

        result = await self.db.execute(query.limit(limit).offset(offset))
        count_result = await self.db.execute(count_query)
        return list(result.scalars().all()), count_result.scalar() or 0

    async def count_by_status(self, status: EquipmentStatus) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Equipment).where(Equipment.status == status)
        )
        return result.scalar() or 0

    async def update(self, equipment: Equipment, data: dict) -> Equipment:
        for key, value in data.items():
            if value is not None:
                setattr(equipment, key, value)
        await self.db.commit()
        await self.db.refresh(equipment)
        return equipment
