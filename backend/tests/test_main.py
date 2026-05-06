from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_create_audit():
    response = client.post("/audits", json={"site_id": "SITE-001"})
    assert response.status_code == 200
    data = response.json()
    assert data["site_id"] == "SITE-001"
    assert "id" in data

def test_get_breakdown():
    response = client.get("/audits/abc/breakdown")
    assert response.status_code == 200
    assert len(response.json()) == 4
