import pytest


@pytest.mark.asyncio
async def test_create_equipment(client):
    resp = await client.post("/api/v1/equipment/", json={
        "serial_number": "EQ-001",
        "equipment_type": "roll_off",
        "capacity_yards": 20,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["serial_number"] == "EQ-001"
    assert data["status"] == "available"


@pytest.mark.asyncio
async def test_duplicate_serial_rejected(client):
    payload = {"serial_number": "EQ-DUP", "equipment_type": "dumpster"}
    await client.post("/api/v1/equipment/", json=payload)
    resp = await client.post("/api/v1/equipment/", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_list_equipment(client):
    await client.post("/api/v1/equipment/", json={"serial_number": "EQ-L1", "equipment_type": "baler"})
    resp = await client.get("/api/v1/equipment/")
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


@pytest.mark.asyncio
async def test_get_equipment_not_found(client):
    resp = await client.get("/api/v1/equipment/nonexistent-id")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_equipment(client):
    create = await client.post("/api/v1/equipment/", json={"serial_number": "EQ-U1", "equipment_type": "cart"})
    eid = create.json()["id"]
    resp = await client.put(f"/api/v1/equipment/{eid}", json={"status": "maintenance"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "maintenance"


@pytest.mark.asyncio
async def test_delete_equipment(client):
    create = await client.post("/api/v1/equipment/", json={"serial_number": "EQ-D1", "equipment_type": "compactor"})
    eid = create.json()["id"]
    del_resp = await client.delete(f"/api/v1/equipment/{eid}")
    assert del_resp.status_code == 204
    get_resp = await client.get(f"/api/v1/equipment/{eid}")
    assert get_resp.status_code == 404
