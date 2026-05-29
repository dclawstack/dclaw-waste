"""Tests for v1.3 routes: vendors, carbon, invoices, hazmat, seed, classify, anomalies."""
import pytest


# ── Vendors ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_vendor(client):
    resp = await client.post("/api/v1/vendors/", json={
        "name": "GreenHaul Co", "vendor_type": "hauler",
        "service_areas": "Austin, TX", "accepted_waste_types": "general,recyclable",
    })
    assert resp.status_code == 201
    assert resp.json()["name"] == "GreenHaul Co"


@pytest.mark.asyncio
async def test_list_vendors(client):
    await client.post("/api/v1/vendors/", json={"name": "RecyclePlus", "vendor_type": "recycler"})
    resp = await client.get("/api/v1/vendors/")
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


@pytest.mark.asyncio
async def test_vendor_not_found(client):
    resp = await client.get("/api/v1/vendors/no-such-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_vendor(client):
    create = await client.post("/api/v1/vendors/", json={"name": "OldName", "vendor_type": "processor"})
    vid = create.json()["id"]
    resp = await client.put(f"/api/v1/vendors/{vid}", json={"name": "NewName"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "NewName"


# ── Invoices ───────────────────────────────────────────────────────────────────

async def _make_equipment_and_contract(client) -> str:
    eq = await client.post("/api/v1/equipment/", json={"serial_number": "EQ-INV-01", "equipment_type": "dumpster"})
    eid = eq.json()["id"]
    c = await client.post("/api/v1/leases/", json={
        "equipment_id": eid, "customer_name": "Invoice Co", "customer_email": "i@i.com",
        "service_address": "1 Bill St", "start_date": "2026-01-01",
        "end_date": "2026-12-31", "monthly_rate": 400,
    })
    return c.json()["id"]


@pytest.mark.asyncio
async def test_create_invoice(client):
    cid = await _make_equipment_and_contract(client)
    resp = await client.post("/api/v1/invoices/", json={
        "contract_id": cid, "period_start": "2026-06-01", "period_end": "2026-06-30",
        "base_amount": 400, "due_date": "2026-07-15",
    })
    assert resp.status_code == 201
    assert resp.json()["total"] == 400.0


@pytest.mark.asyncio
async def test_generate_invoice(client):
    cid = await _make_equipment_and_contract(client)
    resp = await client.post(f"/api/v1/invoices/generate/{cid}")
    assert resp.status_code == 201
    assert resp.json()["contract_id"] == cid
    assert resp.json()["status"] == "draft"


@pytest.mark.asyncio
async def test_mark_invoice_paid(client):
    cid = await _make_equipment_and_contract(client)
    inv = await client.post("/api/v1/invoices/", json={
        "contract_id": cid, "period_start": "2026-05-01", "period_end": "2026-05-31",
        "base_amount": 400, "due_date": "2026-06-15",
    })
    iid = inv.json()["id"]
    paid = await client.post(f"/api/v1/invoices/{iid}/pay")
    assert paid.status_code == 200
    assert paid.json()["status"] == "paid"


# ── Hazmat ─────────────────────────────────────────────────────────────────────

async def _make_site(client, name="Hazmat Site") -> str:
    resp = await client.post("/api/v1/sites/", json={
        "name": name, "address": "99 Chemical Row",
        "site_type": "industrial", "customer_name": "HazCo",
    })
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_hazmat(client):
    sid = await _make_site(client)
    resp = await client.post("/api/v1/hazmat/", json={
        "site_id": sid, "waste_type_detail": "Used motor oil",
        "un_number": "UN1268", "hazard_class": "3",
        "quantity_kg": 50.0,
    })
    assert resp.status_code == 201
    assert resp.json()["un_number"] == "UN1268"
    assert resp.json()["status"] == "pending"


@pytest.mark.asyncio
async def test_hazmat_update_manifest(client):
    sid = await _make_site(client, "Hazmat Site 2")
    create = await client.post("/api/v1/hazmat/", json={
        "site_id": sid, "waste_type_detail": "Battery acid",
        "un_number": "UN2796", "hazard_class": "8", "quantity_kg": 12.5,
    })
    hid = create.json()["id"]
    resp = await client.put(f"/api/v1/hazmat/{hid}", json={"manifest_number": "MNF-2026-001", "status": "manifested"})
    assert resp.status_code == 200
    assert resp.json()["manifest_number"] == "MNF-2026-001"


# ── Seed ───────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_seed_creates_data(client):
    resp = await client.post("/api/v1/seed/")
    assert resp.status_code == 201
    data = resp.json()
    assert data["equipment_created"] > 0
    assert data["sites_created"] > 0
    assert data["waste_records_created"] > 0


# ── Classify ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_classify_recyclable(client):
    resp = await client.post("/api/v1/waste/classify", json={"description": "cardboard boxes and plastic bottles"})
    assert resp.status_code == 200
    assert resp.json()["waste_type"] == "recyclable"


@pytest.mark.asyncio
async def test_classify_organic(client):
    resp = await client.post("/api/v1/waste/classify", json={"description": "food scraps and garden waste"})
    assert resp.status_code == 200
    assert resp.json()["waste_type"] == "organic"


@pytest.mark.asyncio
async def test_classify_default(client):
    resp = await client.post("/api/v1/waste/classify", json={"description": "mixed unidentified stuff"})
    assert resp.status_code == 200
    assert resp.json()["waste_type"] == "general"


# ── Carbon ──────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_carbon_report_empty(client):
    resp = await client.get("/api/v1/carbon/report")
    assert resp.status_code == 200
    assert "total_co2e_kg" in resp.json()


# ── Route optimizer ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_route_optimizer(client):
    stops = [
        {"job_id": "j1", "lat": 30.267, "lng": -97.743},
        {"job_id": "j2", "lat": 30.300, "lng": -97.700},
        {"job_id": "j3", "lat": 30.250, "lng": -97.780},
    ]
    resp = await client.post("/api/v1/schedule/optimize-route", json=stops)
    assert resp.status_code == 200
    data = resp.json()
    assert data["stop_count"] == 3
    assert set(data["ordered_job_ids"]) == {"j1", "j2", "j3"}
