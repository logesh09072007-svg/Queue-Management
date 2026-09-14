import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def get_admin_token():
    res = client.post("/api/auth/login", json={
        "email": "admin@queuesense.ai",
        "password": "admin123"
    })
    return res.json()["access_token"]

def test_get_current_queue():
    res = client.get("/api/queue/current")
    assert res.status_code == 200
    data = res.json()
    assert "queue_length" in data
    assert "crowd_level" in data
    assert "estimated_wait_minutes" in data
    assert data["estimated_wait_minutes"] >= 0
    assert data["crowd_level"] in ["LOW", "MEDIUM", "HIGH", "VERY HIGH"]

def test_admin_update_queue_success():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "queue_length": 25,
        "active_counters": 3,
        "orders_pending": 4,
        "customers_served": 50,
        "average_service_time": 1.5,
        "notes": "Test rush update"
    }
    res = client.post("/api/queue/update", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["queue_length"] == 25
    assert data["active_counters"] == 3

def test_admin_update_queue_invalid_input():
    token = get_admin_token()
    headers = {"Authorization": f"Bearer {token}"}
    # Negative queue length should fail validation
    payload = {
        "queue_length": -5,
        "active_counters": 0,
        "average_service_time": -1.0
    }
    res = client.post("/api/queue/update", json=payload, headers=headers)
    assert res.status_code == 422 # Unprocessable Entity

def test_student_cannot_update_queue():
    # Login as student
    res = client.post("/api/auth/login", json={
        "email": "student@college.edu",
        "password": "student123"
    })
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "queue_length": 10,
        "active_counters": 2,
        "average_service_time": 1.5
    }
    res = client.post("/api/queue/update", json=payload, headers=headers)
    assert res.status_code == 403 # Forbidden
