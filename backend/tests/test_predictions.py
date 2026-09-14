import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_get_today_predictions():
    res = client.get("/api/predictions/today")
    assert res.status_code == 200
    slots = res.json()
    assert isinstance(slots, list)
    assert len(slots) > 0
    first = slots[0]
    assert "time" in first
    assert "predicted_customers" in first
    assert "predicted_wait_minutes" in first
    assert first["predicted_wait_minutes"] >= 0

def test_get_upcoming_predictions():
    res = client.get("/api/predictions/upcoming?max_slots=5")
    assert res.status_code == 200
    slots = res.json()
    assert isinstance(slots, list)
    assert len(slots) <= 5

def test_get_recommended_time():
    res = client.get("/api/predictions/recommended")
    assert res.status_code == 200
    data = res.json()
    assert "recommended_window" in data
    assert "why" in data
    assert "crowd_level" in data
    assert data["crowd_level"] in ["LOW", "MEDIUM", "HIGH", "VERY HIGH"]
    assert data["confidence"] > 0

def test_custom_prediction():
    payload = {
        "hour": 13,
        "minute": 0,
        "day_of_week": 2,
        "queue_length": 30,
        "active_counters": 3,
        "orders_pending": 5,
        "average_service_time": 1.5
    }
    res = client.post("/api/predictions/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_customers"] > 0
    assert data["predicted_wait_minutes"] >= 0
    assert data["crowd_level"] in ["LOW", "MEDIUM", "HIGH", "VERY HIGH"]
