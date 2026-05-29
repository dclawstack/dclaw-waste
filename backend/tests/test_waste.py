import pytest


async def _make_site(client, name: str = "Test Site") -> str:
    resp = await client.post("/api/v1/sites/", json={
        "name": name,
        "address": "1 Industrial Rd",
        "site_type": "warehouse",
        "customer_name": "Test Co",
    })
    assert resp.status_code == 201
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_site(client):
    resp = await client.post("/api/v1/sites/", json={
        "name": "HQ Office",
        "address": "10 Corp Blvd",
        "site_type": "office",
        "customer_name": "Corp Ltd",
    })
    assert resp.status_code == 201
    assert resp.json()["name"] == "HQ Office"


@pytest.mark.asyncio
async def test_create_waste_record(client):
    sid = await _make_site(client, "Waste Site 1")
    resp = await client.post("/api/v1/waste/", json={
        "site_id": sid,
        "waste_type": "recyclable",
        "weight_kg": 125.5,
        "diversion_method": "recycle",
    })
    assert resp.status_code == 201
    assert resp.json()["waste_type"] == "recyclable"


@pytest.mark.asyncio
async def test_waste_record_invalid_site(client):
    resp = await client.post("/api/v1/waste/", json={
        "site_id": "nonexistent",
        "waste_type": "general",
        "weight_kg": 50,
        "diversion_method": "landfill",
    })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_waste_summary(client):
    sid = await _make_site(client, "Summary Site")
    await client.post("/api/v1/waste/", json={"site_id": sid, "waste_type": "general", "weight_kg": 100, "diversion_method": "landfill"})
    await client.post("/api/v1/waste/", json={"site_id": sid, "waste_type": "recyclable", "weight_kg": 60, "diversion_method": "recycle"})
    resp = await client.get("/api/v1/waste/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_weight_kg"] >= 160
    assert data["diversion_rate_pct"] > 0


@pytest.mark.asyncio
async def test_get_site_not_found(client):
    resp = await client.get("/api/v1/sites/bad-id")
    assert resp.status_code == 404
