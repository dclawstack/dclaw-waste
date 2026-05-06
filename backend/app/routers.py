from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid, random
from app.database import get_db

router = APIRouter()

class CreateAuditRequest(BaseModel):
    site_id: str

class WasteAudit(BaseModel):
    id: str
    site_id: str
    total_waste_kg: float
    recycling_rate: float
    compostable_fraction: str
    reduction_recommendations: list[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/audits", response_model=WasteAudit)
def create_audit(req: CreateAuditRequest, db: Session = Depends(get_db)):
    return WasteAudit(
        id=str(uuid.uuid4()),
        site_id=req.site_id,
        total_waste_kg=round(random.uniform(100, 5000), 2),
        recycling_rate=round(random.uniform(20, 80), 1),
        compostable_fraction="35%",
        reduction_recommendations=["Eliminate single-use plastic"],
        created_at=datetime.utcnow(),
    )

@router.get("/audits/{id}/breakdown")
def get_breakdown(id: str, db: Session = Depends(get_db)):
    return [
        {"category": "General Waste", "percentage": round(random.uniform(20, 50), 1)},
        {"category": "Recyclables", "percentage": round(random.uniform(15, 40), 1)},
        {"category": "Organic", "percentage": round(random.uniform(10, 30), 1)},
        {"category": "Hazardous", "percentage": round(random.uniform(1, 10), 1)},
    ]
