from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.waste_repo import WasteRecordRepository
from app.services.carbon import calculate_emission

router = APIRouter()


class CarbonLine(BaseModel):
    waste_type: str
    diversion_method: str
    weight_kg: float
    factor: float
    co2e_kg: float


class CarbonReport(BaseModel):
    total_co2e_kg: float
    avoided_co2e_kg: float
    net_co2e_kg: float
    by_stream: list[CarbonLine]
    scope3_classification: str


@router.get("/report", response_model=CarbonReport)
async def carbon_report(
    site_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    repo = WasteRecordRepository(db)
    rows = await repo.summary(site_id=site_id)

    lines: list[CarbonLine] = []
    total_co2e = 0.0
    avoided = 0.0

    for row in rows:
        line = calculate_emission(
            waste_type=str(row.waste_type),
            diversion_method=str(row.diversion_method),
            weight_kg=float(row.total_kg or 0),
        )
        lines.append(CarbonLine(
            waste_type=line.waste_type,
            diversion_method=line.diversion_method,
            weight_kg=line.weight_kg,
            factor=line.factor,
            co2e_kg=line.co2e_kg,
        ))
        total_co2e += line.co2e_kg
        if line.co2e_kg < 0:
            avoided += abs(line.co2e_kg)

    lines.sort(key=lambda x: abs(x.co2e_kg), reverse=True)

    return CarbonReport(
        total_co2e_kg=round(total_co2e, 3),
        avoided_co2e_kg=round(avoided, 3),
        net_co2e_kg=round(total_co2e, 3),
        by_stream=lines,
        scope3_classification="Scope 3 — Category 5 (Waste generated in operations)",
    )
