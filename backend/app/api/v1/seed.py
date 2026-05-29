"""
Seed endpoint — creates realistic demo data in one call.
Safe to call multiple times (skips on unique-constraint conflicts).
"""
import uuid
import logging
from datetime import date, timedelta, datetime
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.equipment import Equipment, EquipmentType, EquipmentStatus
from app.models.lease import LeaseContract, LeaseEvent, ContractStatus, BillingCycle, LeaseEventType
from app.models.waste import Site, WasteRecord, SiteType, WasteType, DiversionMethod
from app.models.schedule import CollectionJob, JobType, JobStatus, TimeWindow

logger = logging.getLogger(__name__)
router = APIRouter()


class SeedResult(BaseModel):
    equipment_created: int
    sites_created: int
    contracts_created: int
    waste_records_created: int
    jobs_created: int
    message: str


@router.post("/", response_model=SeedResult, status_code=201)
async def seed_demo_data(db: AsyncSession = Depends(get_db)):
    eq_count = site_count = contract_count = waste_count = job_count = 0

    # ── Equipment ────────────────────────────────────────────────────────────
    equipment_data = [
        ("EQ-DEMO-001", EquipmentType.roll_off, 20, EquipmentStatus.deployed),
        ("EQ-DEMO-002", EquipmentType.roll_off, 30, EquipmentStatus.available),
        ("EQ-DEMO-003", EquipmentType.compactor, None, EquipmentStatus.deployed),
        ("EQ-DEMO-004", EquipmentType.baler, None, EquipmentStatus.available),
        ("EQ-DEMO-005", EquipmentType.dumpster, 4, EquipmentStatus.maintenance),
        ("EQ-DEMO-006", EquipmentType.cart, None, EquipmentStatus.available),
    ]
    equipment_ids: list[str] = []
    for serial, eq_type, cap, status in equipment_data:
        try:
            eq = Equipment(id=str(uuid.uuid4()), serial_number=serial, equipment_type=eq_type,
                           capacity_yards=cap, status=status)
            db.add(eq)
            await db.flush()
            equipment_ids.append(eq.id)
            eq_count += 1
        except Exception:
            await db.rollback()

    # ── Sites ─────────────────────────────────────────────────────────────────
    sites_data = [
        ("Greenfield Office HQ", "100 Corporate Blvd, Austin TX", SiteType.office, "Greenfield Corp"),
        ("Riverside Warehouse", "450 Industrial Way, Austin TX", SiteType.warehouse, "Riverside Logistics"),
        ("Downtown Restaurant Row", "12 Main St, Austin TX", SiteType.restaurant, "Foodie Group LLC"),
        ("Lakeside Construction Site", "888 Lake Rd, Austin TX", SiteType.construction, "BuildRight Inc"),
    ]
    site_ids: list[str] = []
    for name, addr, stype, customer in sites_data:
        try:
            site = Site(id=str(uuid.uuid4()), name=name, address=addr, site_type=stype,
                        customer_name=customer, active=True)
            db.add(site)
            await db.flush()
            site_ids.append(site.id)
            site_count += 1
        except Exception:
            await db.rollback()

    await db.commit()

    # ── Lease contracts ───────────────────────────────────────────────────────
    contracts_data = [
        (0, 0, "Greenfield Corp", "ops@greenfield.com", "100 Corporate Blvd", date(2026, 1, 1), date(2026, 12, 31), 450.00),
        (2, 1, "Riverside Logistics", "mgr@riverside.com", "450 Industrial Way", date(2026, 3, 1), date(2026, 8, 31), 320.00),
        (1, 2, "Foodie Group LLC", "admin@foodie.com", "12 Main St", date(2026, 2, 1), date(2026, 7, 20), 280.00),
    ]
    contract_ids: list[str] = []
    if equipment_ids and site_ids:
        for eq_idx, _, cname, cemail, caddr, start, end, rate in contracts_data:
            if eq_idx < len(equipment_ids):
                cid = str(uuid.uuid4())
                c = LeaseContract(
                    id=cid, equipment_id=equipment_ids[eq_idx],
                    customer_name=cname, customer_email=cemail, service_address=caddr,
                    start_date=start, end_date=end, monthly_rate=rate,
                    billing_cycle=BillingCycle.monthly, status=ContractStatus.active,
                    auto_renew=True,
                )
                db.add(c)
                # delivery event
                db.add(LeaseEvent(id=str(uuid.uuid4()), contract_id=cid, event_type=LeaseEventType.delivery,
                                  scheduled_at=datetime.combine(start, datetime.min.time()),
                                  driver_notes="Delivered on schedule"))
                contract_ids.append(cid)
                contract_count += 1
        await db.commit()

    # ── Waste records (30 days of data) ──────────────────────────────────────
    import random
    random.seed(42)
    waste_scenarios = [
        (WasteType.recyclable, DiversionMethod.recycle, 80, 150),
        (WasteType.general, DiversionMethod.landfill, 200, 400),
        (WasteType.organic, DiversionMethod.compost, 30, 80),
        (WasteType.general, DiversionMethod.landfill, 100, 250),
        (WasteType.recyclable, DiversionMethod.recycle, 50, 120),
        (WasteType.construction, DiversionMethod.reuse, 300, 700),
    ]
    today = date.today()
    for i, sid in enumerate(site_ids):
        for days_ago in range(30, 0, -3):
            rec_date = today - timedelta(days=days_ago)
            wtype, method, lo, hi = waste_scenarios[i % len(waste_scenarios)]
            kg = round(random.uniform(lo, hi), 1)
            rec = WasteRecord(
                id=str(uuid.uuid4()), site_id=sid, waste_type=wtype, weight_kg=kg,
                diversion_method=method, recorded_at=datetime.combine(rec_date, datetime.min.time()),
            )
            db.add(rec)
            waste_count += 1

    # ── Collection jobs ───────────────────────────────────────────────────────
    job_configs = [
        (0, JobType.regular_collection, today + timedelta(days=1), TimeWindow.morning),
        (1, JobType.regular_collection, today + timedelta(days=1), TimeWindow.afternoon),
        (2, JobType.pickup, today + timedelta(days=2), TimeWindow.anytime),
        (0, JobType.delivery, today - timedelta(days=2), TimeWindow.morning),
        (1, JobType.swap, today - timedelta(days=1), TimeWindow.anytime),
    ]
    for si, jtype, sched_date, window in job_configs:
        if si < len(site_ids):
            status = JobStatus.completed if sched_date < today else JobStatus.scheduled
            db.add(CollectionJob(
                id=str(uuid.uuid4()), site_id=site_ids[si],
                job_type=jtype, scheduled_date=sched_date,
                time_window=window, status=status,
            ))
            job_count += 1

    await db.commit()
    logger.info("Seed complete: %d equipment, %d sites, %d contracts, %d waste records, %d jobs",
                eq_count, site_count, contract_count, waste_count, job_count)

    return SeedResult(
        equipment_created=eq_count, sites_created=site_count,
        contracts_created=contract_count, waste_records_created=waste_count,
        jobs_created=job_count,
        message="Demo data created. Refresh the dashboard to see it.",
    )
