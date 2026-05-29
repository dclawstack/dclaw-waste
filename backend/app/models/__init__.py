# Import all models here so SQLAlchemy metadata and alembic autogenerate can discover them.
from app.models.base import Base
from app.models.equipment import Equipment, EquipmentType, EquipmentStatus
from app.models.lease import LeaseContract, LeaseEvent, DamageAssessment, ContractStatus, BillingCycle, LeaseEventType, DamageSeverity
from app.models.waste import Site, WasteRecord, SiteType, WasteType, DiversionMethod
from app.models.schedule import CollectionJob, JobType, JobStatus, TimeWindow
from app.models.vendor import Vendor, VendorType
from app.models.invoice import Invoice, InvoiceStatus
from app.models.hazmat import HazmatRecord, HazmatStatus
from app.models.user import User, UserRole

__all__ = [
    "Base",
    "Equipment", "EquipmentType", "EquipmentStatus",
    "LeaseContract", "LeaseEvent", "DamageAssessment",
    "ContractStatus", "BillingCycle", "LeaseEventType", "DamageSeverity",
    "Site", "WasteRecord", "SiteType", "WasteType", "DiversionMethod",
    "CollectionJob", "JobType", "JobStatus", "TimeWindow",
    "Vendor", "VendorType",
    "Invoice", "InvoiceStatus",
    "HazmatRecord", "HazmatStatus",
    "User", "UserRole",
]
