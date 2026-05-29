from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.lease import LeaseContract, LeaseEvent, DamageAssessment, ContractStatus
from app.repositories.base_repo import BaseRepository


class LeaseRepository(BaseRepository[LeaseContract]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, LeaseContract)

    async def get_with_relations(self, contract_id: str) -> LeaseContract | None:
        result = await self.db.execute(
            select(LeaseContract)
            .options(selectinload(LeaseContract.events), selectinload(LeaseContract.damage_assessments))
            .where(LeaseContract.id == contract_id)
        )
        return result.scalar_one_or_none()

    async def list_filtered(
        self,
        status: ContractStatus | None = None,
        customer_name: str | None = None,
        expiring_within_days: int | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[LeaseContract], int]:
        query = select(LeaseContract)
        count_query = select(func.count()).select_from(LeaseContract)

        if status:
            query = query.where(LeaseContract.status == status)
            count_query = count_query.where(LeaseContract.status == status)
        if customer_name:
            like = f"%{customer_name}%"
            query = query.where(LeaseContract.customer_name.ilike(like))
            count_query = count_query.where(LeaseContract.customer_name.ilike(like))
        if expiring_within_days is not None:
            cutoff = date.today() + timedelta(days=expiring_within_days)
            query = query.where(
                LeaseContract.end_date <= cutoff,
                LeaseContract.status == ContractStatus.active,
            )
            count_query = count_query.where(
                LeaseContract.end_date <= cutoff,
                LeaseContract.status == ContractStatus.active,
            )

        result = await self.db.execute(query.order_by(LeaseContract.end_date).limit(limit).offset(offset))
        count_result = await self.db.execute(count_query)
        return list(result.scalars().all()), count_result.scalar() or 0

    async def count_by_status(self, status: ContractStatus) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(LeaseContract).where(LeaseContract.status == status)
        )
        return result.scalar() or 0

    async def count_expiring_soon(self, days: int = 30) -> int:
        cutoff = date.today() + timedelta(days=days)
        result = await self.db.execute(
            select(func.count())
            .select_from(LeaseContract)
            .where(LeaseContract.end_date <= cutoff, LeaseContract.status == ContractStatus.active)
        )
        return result.scalar() or 0

    async def update(self, contract: LeaseContract, data: dict) -> LeaseContract:
        for key, value in data.items():
            if value is not None:
                setattr(contract, key, value)
        await self.db.commit()
        await self.db.refresh(contract)
        return contract

    async def add_event(self, event: LeaseEvent) -> LeaseEvent:
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event

    async def add_damage(self, assessment: DamageAssessment) -> DamageAssessment:
        self.db.add(assessment)
        await self.db.commit()
        await self.db.refresh(assessment)
        return assessment

    async def get_events(self, contract_id: str) -> list[LeaseEvent]:
        result = await self.db.execute(
            select(LeaseEvent)
            .where(LeaseEvent.contract_id == contract_id)
            .order_by(LeaseEvent.scheduled_at)
        )
        return list(result.scalars().all())

    async def get_damages(self, contract_id: str) -> list[DamageAssessment]:
        result = await self.db.execute(
            select(DamageAssessment).where(DamageAssessment.contract_id == contract_id)
        )
        return list(result.scalars().all())
