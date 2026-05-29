from fastapi import APIRouter
from app.api.v1 import equipment, leases, sites, waste, schedule, dashboard, copilot
from app.api.v1 import vendors, carbon, invoices, hazmat, seed, auth, esg

v1_router = APIRouter(prefix="/api/v1")

v1_router.include_router(auth.router,       prefix="/auth",       tags=["auth"])
v1_router.include_router(equipment.router,  prefix="/equipment",  tags=["equipment"])
v1_router.include_router(leases.router,     prefix="/leases",     tags=["leases"])
v1_router.include_router(sites.router,      prefix="/sites",      tags=["sites"])
v1_router.include_router(waste.router,      prefix="/waste",      tags=["waste"])
v1_router.include_router(schedule.router,   prefix="/schedule",   tags=["schedule"])
v1_router.include_router(dashboard.router,  prefix="/dashboard",  tags=["dashboard"])
v1_router.include_router(copilot.router,    prefix="/copilot",    tags=["copilot"])
v1_router.include_router(vendors.router,    prefix="/vendors",    tags=["vendors"])
v1_router.include_router(carbon.router,     prefix="/carbon",     tags=["carbon"])
v1_router.include_router(invoices.router,   prefix="/invoices",   tags=["invoices"])
v1_router.include_router(hazmat.router,     prefix="/hazmat",     tags=["hazmat"])
v1_router.include_router(esg.router,        prefix="/esg",        tags=["esg"])
v1_router.include_router(seed.router,       prefix="/seed",       tags=["seed"])
