"""
ESG / Sustainability Report endpoint.
Aggregates waste, carbon, LEED metrics into a single shareable report.
"""
import logging
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.waste_repo import WasteRecordRepository, SiteRepository
from app.repositories.lease_repo import LeaseRepository
from app.repositories.equipment_repo import EquipmentRepository
from app.models.waste import DiversionMethod
from app.models.lease import ContractStatus
from app.services.carbon import calculate_emission

logger = logging.getLogger(__name__)
router = APIRouter()


class SiteBreakdown(BaseModel):
    site_id: str
    site_name: str
    total_kg: float
    diversion_rate_pct: float
    co2e_kg: float


class ESGReport(BaseModel):
    generated_at: str
    period: str

    # Waste metrics
    total_waste_kg: float
    recycled_kg: float
    composted_kg: float
    reused_kg: float
    landfill_kg: float
    diverted_kg: float
    diversion_rate_pct: float

    # Carbon metrics
    total_co2e_kg: float
    avoided_co2e_kg: float
    net_co2e_kg: float

    # LEED estimate
    leed_mr_credits: float          # LEED MR4/MR5 credits (0–2 based on diversion)
    certification_level: str        # "Zero Waste" | "LEED Platinum" | "LEED Gold" | "LEED Silver" | "Baseline"
    certification_color: str        # green / blue / yellow / gray

    # Operational
    active_leases: int
    total_sites: int
    waste_intensity_kg_per_site: float

    # Per-site breakdown
    by_site: list[SiteBreakdown]

    # Plain-English highlights
    highlights: list[str]


def _leed_credits(diversion_rate: float) -> float:
    if diversion_rate >= 95:   return 2.0
    if diversion_rate >= 75:   return 1.5
    if diversion_rate >= 50:   return 1.0
    if diversion_rate >= 25:   return 0.5
    return 0.0


def _certification(rate: float) -> tuple[str, str]:
    if rate >= 90: return "Zero Waste (90%+)", "green"
    if rate >= 75: return "LEED Platinum (75%+)", "blue"
    if rate >= 50: return "LEED Gold (50%+)", "yellow"
    if rate >= 25: return "LEED Silver (25%+)", "orange"
    return "Baseline", "gray"


def _insights(report_data: dict) -> list[str]:
    insights = []
    rate = report_data["diversion_rate_pct"]
    avoided = report_data["avoided_co2e_kg"]
    total = report_data["total_waste_kg"]
    active = report_data["active_leases"]

    if rate >= 75:
        insights.append(f"Outstanding diversion rate of {rate}% — you qualify for LEED MR credits.")
    elif rate >= 50:
        insights.append(f"Good diversion rate of {rate}%. Increase composting to push above 75% for LEED Platinum.")
    else:
        insights.append(f"Diversion rate of {rate}% is below industry average (60%). Focus on recyclables separation.")

    if avoided > 0:
        insights.append(f"Your waste diversion programs avoided {avoided:,.1f} kg CO₂e — equivalent to planting {int(avoided / 21)} trees.")

    if total > 0:
        insights.append(f"Total waste processed: {total:,.1f} kg across {report_data['total_sites']} sites.")

    if active > 0:
        insights.append(f"{active} active equipment leases managed on-platform — lease revenue tracking enabled.")

    return insights[:4]


@router.get("/report", response_model=ESGReport)
async def esg_report(
    site_id: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    from datetime import datetime

    waste_repo = WasteRecordRepository(db)
    site_repo = SiteRepository(db)
    lease_repo = LeaseRepository(db)
    equip_repo = EquipmentRepository(db)

    # ── Waste aggregation ──────────────────────────────────────────────────────
    rows = await waste_repo.summary(site_id=site_id)
    total_kg = recycled = composted = reused = landfill = 0.0
    total_co2e = avoided_co2e = 0.0

    for row in rows:
        kg = float(row.total_kg or 0)
        method = str(row.diversion_method)
        wtype = str(row.waste_type)
        total_kg += kg
        if method == "landfill":   landfill += kg
        elif method == "recycle":  recycled += kg
        elif method == "compost":  composted += kg
        elif method in ("reuse", "donate"): reused += kg

        line = calculate_emission(wtype, method, kg)
        total_co2e += line.co2e_kg
        if line.co2e_kg < 0:
            avoided_co2e += abs(line.co2e_kg)

    diverted_kg = total_kg - landfill
    diversion_rate = round(diverted_kg / total_kg * 100, 1) if total_kg > 0 else 0.0
    net_co2e = round(total_co2e, 2)

    # ── Per-site breakdown ──────────────────────────────────────────────────────
    all_sites, _ = await site_repo.list_filtered(limit=100, offset=0)
    site_rows: list[SiteBreakdown] = []
    for site in all_sites:
        site_waste = await waste_repo.summary(site_id=site.id)
        s_total = s_diverted = s_co2e = 0.0
        for r in site_waste:
            kg = float(r.total_kg or 0)
            s_total += kg
            if str(r.diversion_method) != "landfill":
                s_diverted += kg
            line = calculate_emission(str(r.waste_type), str(r.diversion_method), kg)
            s_co2e += line.co2e_kg
        if s_total > 0:
            site_rows.append(SiteBreakdown(
                site_id=site.id,
                site_name=site.name,
                total_kg=round(s_total, 1),
                diversion_rate_pct=round(s_diverted / s_total * 100, 1),
                co2e_kg=round(s_co2e, 2),
            ))

    # ── Operational context ────────────────────────────────────────────────────
    active_leases = await lease_repo.count_by_status(ContractStatus.active)
    total_sites = await site_repo.count()
    intensity = round(total_kg / total_sites, 1) if total_sites > 0 else 0.0

    leed = _leed_credits(diversion_rate)
    cert, color = _certification(diversion_rate)

    report_data = {
        "diversion_rate_pct": diversion_rate,
        "avoided_co2e_kg": round(avoided_co2e, 2),
        "total_waste_kg": round(total_kg, 1),
        "total_sites": total_sites,
        "active_leases": active_leases,
    }

    return ESGReport(
        generated_at=datetime.utcnow().isoformat() + "Z",
        period="All time",
        total_waste_kg=round(total_kg, 1),
        recycled_kg=round(recycled, 1),
        composted_kg=round(composted, 1),
        reused_kg=round(reused, 1),
        landfill_kg=round(landfill, 1),
        diverted_kg=round(diverted_kg, 1),
        diversion_rate_pct=diversion_rate,
        total_co2e_kg=round(total_co2e, 2),
        avoided_co2e_kg=round(avoided_co2e, 2),
        net_co2e_kg=net_co2e,
        leed_mr_credits=leed,
        certification_level=cert,
        certification_color=color,
        active_leases=active_leases,
        total_sites=total_sites,
        waste_intensity_kg_per_site=intensity,
        by_site=sorted(site_rows, key=lambda x: x.total_kg, reverse=True),
        highlights=_insights(report_data),
    )
