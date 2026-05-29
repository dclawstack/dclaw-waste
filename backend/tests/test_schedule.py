import pytest
from datetime import date, timedelta


async def _make_site(client) -> str:
    resp = await client.post("/api/v1/sites/", json={
        "name": "Schedule Site", "address": "1 Route Rd",
        "site_type": "industrial", "customer_name": "Sched Co",
    })
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_job(client):
    sid = await _make_site(client)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    resp = await client.post("/api/v1/schedule/", json={
        "site_id": sid,
        "job_type": "regular_collection",
        "scheduled_date": tomorrow,
        "time_window": "morning",
    })
    assert resp.status_code == 201
    assert resp.json()["status"] == "scheduled"


@pytest.mark.asyncio
async def test_complete_job(client):
    sid = await _make_site(client)
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    create = await client.post("/api/v1/schedule/", json={
        "site_id": sid, "job_type": "pickup",
        "scheduled_date": tomorrow, "time_window": "anytime",
    })
    jid = create.json()["id"]
    resp = await client.post(f"/api/v1/schedule/{jid}/complete")
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_job_invalid_site(client):
    resp = await client.post("/api/v1/schedule/", json={
        "site_id": "bad-id", "job_type": "delivery",
        "scheduled_date": "2026-06-01", "time_window": "anytime",
    })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_dashboard_returns(client):
    resp = await client.get("/api/v1/dashboard/")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_equipment" in data
    assert "active_leases" in data
    assert "diversion_rate_pct" in data
