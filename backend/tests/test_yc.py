"""YC-ready v1.4 tests: auth, ESG report, waste trends, prediction, payment links."""
import pytest


# ── Authentication ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register(client):
    resp = await client.post("/api/v1/auth/register", json={
        "email": "test@greenhaul.com",
        "password": "securepass123",
        "full_name": "Jane Smith",
        "organization_name": "Green Haul Co",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@greenhaul.com"
    assert data["user"]["organization_name"] == "Green Haul Co"


@pytest.mark.asyncio
async def test_duplicate_email_rejected(client):
    payload = {"email": "dup@test.com", "password": "password1", "full_name": "A", "organization_name": "B"}
    await client.post("/api/v1/auth/register", json=payload)
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login(client):
    await client.post("/api/v1/auth/register", json={
        "email": "login@test.com", "password": "mypassword",
        "full_name": "Bob", "organization_name": "TestOrg",
    })
    resp = await client.post("/api/v1/auth/login", json={"email": "login@test.com", "password": "mypassword"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/v1/auth/register", json={
        "email": "wrong@test.com", "password": "correctpass",
        "full_name": "C", "organization_name": "D",
    })
    resp = await client.post("/api/v1/auth/login", json={"email": "wrong@test.com", "password": "wrongpass"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_me_with_token(client):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "me@test.com", "password": "password1",
        "full_name": "Me User", "organization_name": "MyOrg",
    })
    token = reg.json()["access_token"]
    resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@test.com"


@pytest.mark.asyncio
async def test_me_without_token(client):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_weak_password_rejected(client):
    resp = await client.post("/api/v1/auth/register", json={
        "email": "weak@test.com", "password": "abc",
        "full_name": "Weak", "organization_name": "WkOrg",
    })
    assert resp.status_code == 422


# ── ESG Report ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_esg_report_empty(client):
    resp = await client.get("/api/v1/esg/report")
    assert resp.status_code == 200
    data = resp.json()
    assert "diversion_rate_pct" in data
    assert "certification_level" in data
    assert "highlights" in data
    assert isinstance(data["highlights"], list)


@pytest.mark.asyncio
async def test_esg_report_with_data(client):
    # Create site + waste records then check report
    site = await client.post("/api/v1/sites/", json={
        "name": "ESG Site", "address": "1 ESG Rd", "site_type": "office", "customer_name": "ESG Corp"
    })
    sid = site.json()["id"]
    await client.post("/api/v1/waste/", json={"site_id": sid, "waste_type": "recyclable", "weight_kg": 200, "diversion_method": "recycle"})
    await client.post("/api/v1/waste/", json={"site_id": sid, "waste_type": "general", "weight_kg": 100, "diversion_method": "landfill"})

    resp = await client.get("/api/v1/esg/report")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_waste_kg"] >= 300
    assert data["diversion_rate_pct"] > 0
    assert len(data["by_site"]) >= 1
    assert len(data["highlights"]) >= 1


# ── Waste Trends ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_waste_trends_returns_list(client):
    resp = await client.get("/api/v1/waste/trends?weeks=4")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) == 4


@pytest.mark.asyncio
async def test_waste_trends_structure(client):
    resp = await client.get("/api/v1/waste/trends?weeks=2")
    data = resp.json()
    for point in data:
        assert "week_label" in point
        assert "total_kg" in point
        assert "diverted_kg" in point
        assert "diversion_rate_pct" in point


# ── Site Prediction ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_prediction_insufficient_data(client):
    site = await client.post("/api/v1/sites/", json={
        "name": "Pred Site", "address": "2 Pred Rd", "site_type": "warehouse", "customer_name": "PredCo"
    })
    sid = site.json()["id"]
    resp = await client.get(f"/api/v1/sites/{sid}/predict")
    assert resp.status_code == 200
    data = resp.json()
    assert data["confidence"] == "low"
    assert "suggested_next_collection" in data


@pytest.mark.asyncio
async def test_prediction_with_data(client):
    site = await client.post("/api/v1/sites/", json={
        "name": "Trend Site", "address": "3 Trend Rd", "site_type": "industrial", "customer_name": "TrendCo"
    })
    sid = site.json()["id"]
    for kg in [100, 120, 130, 140, 150, 160]:
        await client.post("/api/v1/waste/", json={"site_id": sid, "waste_type": "general", "weight_kg": kg, "diversion_method": "landfill"})

    resp = await client.get(f"/api/v1/sites/{sid}/predict")
    assert resp.status_code == 200
    data = resp.json()
    assert data["avg_weekly_kg"] > 0
    assert data["trend_direction"] in ("increasing", "stable", "decreasing")
    assert "suggested_next_collection" in data


# ── Payment Link ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_payment_link_returns_url(client):
    eq = await client.post("/api/v1/equipment/", json={"serial_number": "EQ-PAY-01", "equipment_type": "compactor"})
    eid = eq.json()["id"]
    c = await client.post("/api/v1/leases/", json={
        "equipment_id": eid, "customer_name": "PayCo", "customer_email": "p@p.com",
        "service_address": "1 Pay St", "start_date": "2026-06-01",
        "end_date": "2026-12-01", "monthly_rate": 300,
    })
    cid = c.json()["id"]
    inv = await client.post("/api/v1/invoices/generate/" + cid)
    iid = inv.json()["id"]

    resp = await client.post(f"/api/v1/invoices/{iid}/payment-link")
    assert resp.status_code == 200
    data = resp.json()
    assert "payment_url" in data
    assert data["payment_url"].startswith("http")
