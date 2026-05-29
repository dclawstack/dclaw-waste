from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.schedule import CollectionJob, JobStatus
from app.repositories.base_repo import BaseRepository


class ScheduleRepository(BaseRepository[CollectionJob]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, CollectionJob)

    async def list_filtered(
        self,
        scheduled_date: date | None = None,
        status: JobStatus | None = None,
        site_id: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[CollectionJob], int]:
        query = select(CollectionJob)
        count_query = select(func.count()).select_from(CollectionJob)

        if scheduled_date:
            query = query.where(CollectionJob.scheduled_date == scheduled_date)
            count_query = count_query.where(CollectionJob.scheduled_date == scheduled_date)
        if status:
            query = query.where(CollectionJob.status == status)
            count_query = count_query.where(CollectionJob.status == status)
        if site_id:
            query = query.where(CollectionJob.site_id == site_id)
            count_query = count_query.where(CollectionJob.site_id == site_id)

        result = await self.db.execute(
            query.order_by(CollectionJob.scheduled_date, CollectionJob.time_window).limit(limit).offset(offset)
        )
        count_result = await self.db.execute(count_query)
        return list(result.scalars().all()), count_result.scalar() or 0

    async def count_for_date(self, d: date) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(CollectionJob).where(CollectionJob.scheduled_date == d)
        )
        return result.scalar() or 0

    async def count_overdue(self) -> int:
        today = date.today()
        result = await self.db.execute(
            select(func.count())
            .select_from(CollectionJob)
            .where(CollectionJob.scheduled_date < today, CollectionJob.status == JobStatus.scheduled)
        )
        return result.scalar() or 0

    async def update(self, job: CollectionJob, data: dict) -> CollectionJob:
        for key, value in data.items():
            if value is not None:
                setattr(job, key, value)
        await self.db.commit()
        await self.db.refresh(job)
        return job
