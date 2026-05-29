from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_equipment: int
    available_equipment: int
    active_leases: int
    expiring_soon: int        # contracts expiring within 30 days
    total_sites: int
    total_waste_kg: float
    diversion_rate_pct: float
    jobs_today: int
    jobs_overdue: int
