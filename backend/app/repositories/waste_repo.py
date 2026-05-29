from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.waste import Site, WasteRecord, DiversionMethod
from app.repositories.base_repo import BaseRepository


class SiteRepository(BaseRepository[Site]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Site)

    async def list_filtered(
        self, active_only: bool = False, limit: int = 20, offset: int = 0
    ) -> tuple[list[Site], int]:
        query = select(Site)
        count_query = select(func.count()).select_from(Site)
        if active_only:
            query = query.where(Site.active == True)  # noqa: E712
            count_query = count_query.where(Site.active == True)  # noqa: E712
        result = await self.db.execute(query.limit(limit).offset(offset))
        count_result = await self.db.execute(count_query)
        return list(result.scalars().all()), count_result.scalar() or 0

    async def update(self, site: Site, data: dict) -> Site:
        for key, value in data.items():
            if value is not None:
                setattr(site, key, value)
        await self.db.commit()
        await self.db.refresh(site)
        return site


class WasteRecordRepository(BaseRepository[WasteRecord]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, WasteRecord)

    async def list_filtered(
        self,
        site_id: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[WasteRecord], int]:
        query = select(WasteRecord)
        count_query = select(func.count()).select_from(WasteRecord)
        if site_id:
            query = query.where(WasteRecord.site_id == site_id)
            count_query = count_query.where(WasteRecord.site_id == site_id)
        result = await self.db.execute(
            query.order_by(WasteRecord.recorded_at.desc()).limit(limit).offset(offset)
        )
        count_result = await self.db.execute(count_query)
        return list(result.scalars().all()), count_result.scalar() or 0

    async def summary(self, site_id: str | None = None):
        query = select(
            WasteRecord.waste_type,
            WasteRecord.diversion_method,
            func.sum(WasteRecord.weight_kg).label("total_kg"),
        ).group_by(WasteRecord.waste_type, WasteRecord.diversion_method)
        if site_id:
            query = query.where(WasteRecord.site_id == site_id)
        result = await self.db.execute(query)
        return result.all()

    async def update(self, record: WasteRecord, data: dict) -> WasteRecord:
        for key, value in data.items():
            if value is not None:
                setattr(record, key, value)
        await self.db.commit()
        await self.db.refresh(record)
        return record
