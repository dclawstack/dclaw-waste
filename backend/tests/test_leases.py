import pytest


async def _make_equipment(client, serial: str = "EQ-LEASE-01") -> str:
    resp = await client.post("/api/v1/equipment/", json={"serial_number": serial, "equipment_type": "roll_off"})
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_lease(client):
    eid = await _make_equipment(client)
    resp = await client.post("/api/v1/leases/", json={
        "equipment_id": eid,
        "customer_name": "Acme Corp",
        "customer_email": "acme@example.com",
        "service_address": "123 Main St",
        "start_date": "2026-06-01",
        "end_date": "2026-12-01",
        "monthly_rate": 350.00,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["customer_name"] == "Acme Corp"
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_lease_invalid_equipment(client):
    resp = await client.post("/api/v1/leases/", json={
        "equipment_id": "does-not-exist",
        "customer_name": "Test",
        "customer_email": "t@t.com",
        "service_address": "1 Road",
        "start_date": "2026-06-01",
        "end_date": "2026-12-01",
        "monthly_rate": 200,
    })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_lease_events_auto_created(client):
    eid = await _make_equipment(client, "EQ-EV-01")
    create = await client.post("/api/v1/leases/", json={
        "equipment_id": eid,
        "customer_name": "Beta LLC",
        "customer_email": "b@b.com",
        "service_address": "456 Oak Ave",
        "start_date": "2026-07-01",
        "end_date": "2027-01-01",
        "monthly_rate": 500,
    })
    cid = create.json()["id"]
    events = await client.get(f"/api/v1/leases/{cid}/events")
    assert events.status_code == 200
    assert len(events.json()) == 1  # auto delivery event


@pytest.mark.asyncio
async def test_get_lease_not_found(client):
    resp = await client.get("/api/v1/leases/no-such-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_add_damage(client):
    eid = await _make_equipment(client, "EQ-DMG-01")
    create = await client.post("/api/v1/leases/", json={
        "equipment_id": eid,
        "customer_name": "Gamma Inc",
        "customer_email": "g@g.com",
        "service_address": "789 Pine",
        "start_date": "2026-06-01",
        "end_date": "2026-12-01",
        "monthly_rate": 250,
    })
    cid = create.json()["id"]
    dmg = await client.post(f"/api/v1/leases/{cid}/damages", json={
        "description": "Dent on left panel",
        "severity": "minor",
        "repair_cost": 150.00,
    })
    assert dmg.status_code == 201
    assert dmg.json()["severity"] == "minor"
