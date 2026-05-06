from sqlalchemy import Column, String, Float, DateTime, func
from app.database import Base

class WasteAuditDB(Base):
    __tablename__ = "waste_audits"
    id = Column(String, primary_key=True)
    site_id = Column(String, nullable=False)
    total_waste_kg = Column(Float, nullable=False)
    recycling_rate = Column(Float)
    compostable_fraction = Column(String)
    reduction_recommendations = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
