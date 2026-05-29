from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.equipment import EquipmentStatus
from app.models.lease import ContractStatus
from app.models.waste import DiversionMethod
from app.repositories.equipment_repo import EquipmentRepository
from app.repositories.lease_repo import LeaseRepository
from app.repositories.waste_repo import WasteRecordRepository, SiteRepository
from app.repositories.schedule_repo import ScheduleRepository
from app.schemas.dashboard import DashboardStats

router = APIRouter()


@router.get("/", response_model=DashboardStats)
async def dashboard(db: AsyncSession = Depends(get_db)):
    equip_repo = EquipmentRepository(db)
    lease_repo = LeaseRepository(db)
    waste_repo = WasteRecordRepository(db)
    site_repo = SiteRepository(db)
    sched_repo = ScheduleRepository(db)

    total_equipment = await equip_repo.count()
    available_equipment = await equip_repo.count_by_status(EquipmentStatus.available)
    active_leases = await lease_repo.count_by_status(ContractStatus.active)
    expiring_soon = await lease_repo.count_expiring_soon(days=30)
    total_sites = await site_repo.count()
    jobs_today = await sched_repo.count_for_date(date.today())
    jobs_overdue = await sched_repo.count_overdue()

    waste_rows = await waste_repo.summary()
    total_kg = 0.0
    diverted_kg = 0.0
    for row in waste_rows:
        kg = float(row.total_kg or 0)
        total_kg += kg
        if row.diversion_method != DiversionMethod.landfill:
            diverted_kg += kg
    diversion_rate = round((diverted_kg / total_kg * 100), 1) if total_kg > 0 else 0.0

    return DashboardStats(
        total_equipment=total_equipment,
        available_equipment=available_equipment,
        active_leases=active_leases,
        expiring_soon=expiring_soon,
        total_sites=total_sites,
        total_waste_kg=round(total_kg, 1),
        diversion_rate_pct=diversion_rate,
        jobs_today=jobs_today,
        jobs_overdue=jobs_overdue,
    )
