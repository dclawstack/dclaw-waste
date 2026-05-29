import csv
import io
import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.lease import ContractStatus, LeaseContract, LeaseEvent, DamageAssessment
from app.repositories.lease_repo import LeaseRepository
from app.repositories.equipment_repo import EquipmentRepository
from app.schemas.lease import (
    LeaseContractCreate, LeaseContractUpdate, LeaseContractRead, LeaseContractList,
    LeaseEventCreate, LeaseEventRead,
    DamageAssessmentCreate, DamageAssessmentRead,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=LeaseContractList)
async def list_leases(
    status: ContractStatus | None = Query(None),
    customer_name: str | None = Query(None),
    expiring_within_days: int | None = Query(None, ge=1),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = LeaseRepository(db)
    items, total = await repo.list_filtered(
        status=status,
        customer_name=customer_name,
        expiring_within_days=expiring_within_days,
        limit=limit,
        offset=offset,
    )
    return LeaseContractList(items=items, total=total, limit=limit, offset=offset)


@router.post("/", response_model=LeaseContractRead, status_code=201)
async def create_lease(payload: LeaseContractCreate, db: AsyncSession = Depends(get_db)):
    equip_repo = EquipmentRepository(db)
    equipment = await equip_repo.get_by_id(payload.equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    contract = LeaseContract(**payload.model_dump())
    repo = LeaseRepository(db)
    contract = await repo.create(contract)

    # Auto-schedule a delivery event
    delivery = LeaseEvent(
        id=str(uuid.uuid4()),
        contract_id=contract.id,
        event_type="delivery",
        scheduled_at=datetime.combine(payload.start_date, datetime.min.time()),
        driver_notes="Auto-scheduled on contract creation",
    )
    await repo.add_event(delivery)
    logger.info("Created lease contract %s for %s", contract.id, contract.customer_name)
    return contract


@router.get("/export/csv")
async def export_leases_csv(db: AsyncSession = Depends(get_db)):
    repo = LeaseRepository(db)
    items, _ = await repo.list_filtered(limit=10000, offset=0)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id","equipment_id","customer_name","customer_email","service_address",
                     "start_date","end_date","monthly_rate","billing_cycle","status","auto_renew"])
    for c in items:
        writer.writerow([c.id, c.equipment_id, c.customer_name, c.customer_email,
                         c.service_address, c.start_date, c.end_date, c.monthly_rate,
                         c.billing_cycle, c.status, c.auto_renew])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=leases.csv"})


@router.get("/{contract_id}", response_model=LeaseContractRead)
async def get_lease(contract_id: str, db: AsyncSession = Depends(get_db)):
    repo = LeaseRepository(db)
    contract = await repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")
    return contract


@router.put("/{contract_id}", response_model=LeaseContractRead)
async def update_lease(
    contract_id: str, payload: LeaseContractUpdate, db: AsyncSession = Depends(get_db)
):
    repo = LeaseRepository(db)
    contract = await repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not data:
        return contract
    return await repo.update(contract, data)


@router.post("/{contract_id}/renew", response_model=LeaseContractRead)
async def renew_lease(contract_id: str, db: AsyncSession = Depends(get_db)):
    from datetime import timedelta
    repo = LeaseRepository(db)
    contract = await repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")

    duration = (contract.end_date - contract.start_date).days
    new_start = contract.end_date
    new_end = new_start + timedelta(days=duration)
    updated = await repo.update(contract, {"start_date": new_start, "end_date": new_end, "status": ContractStatus.active})
    logger.info("Renewed lease %s until %s", contract_id, new_end)
    return updated


@router.delete("/{contract_id}", status_code=204)
async def delete_lease(contract_id: str, db: AsyncSession = Depends(get_db)):
    repo = LeaseRepository(db)
    contract = await repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")
    await repo.delete(contract)


# ── Events sub-resource ──────────────────────────────────────────────────────

@router.get("/{contract_id}/events", response_model=list[LeaseEventRead])
async def list_events(contract_id: str, db: AsyncSession = Depends(get_db)):
    repo = LeaseRepository(db)
    contract = await repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")
    return await repo.get_events(contract_id)


@router.post("/{contract_id}/events", response_model=LeaseEventRead, status_code=201)
async def add_event(
    contract_id: str, payload: LeaseEventCreate, db: AsyncSession = Depends(get_db)
):
    repo = LeaseRepository(db)
    contract = await repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")
    event = LeaseEvent(id=str(uuid.uuid4()), contract_id=contract_id, **payload.model_dump())
    return await repo.add_event(event)


# ── Damage assessments sub-resource ─────────────────────────────────────────

@router.get("/{contract_id}/damages", response_model=list[DamageAssessmentRead])
async def list_damages(contract_id: str, db: AsyncSession = Depends(get_db)):
    repo = LeaseRepository(db)
    contract = await repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")
    return await repo.get_damages(contract_id)


@router.post("/{contract_id}/damages", response_model=DamageAssessmentRead, status_code=201)
async def add_damage(
    contract_id: str, payload: DamageAssessmentCreate, db: AsyncSession = Depends(get_db)
):
    repo = LeaseRepository(db)
    contract = await repo.get_by_id(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Lease contract not found")
    assessment = DamageAssessment(id=str(uuid.uuid4()), contract_id=contract_id, **payload.model_dump())
    return await repo.add_damage(assessment)
