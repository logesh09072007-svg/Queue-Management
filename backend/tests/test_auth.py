import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "QueueSense AI"
    assert data["status"] == "running"

def test_login_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@queuesense.ai",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_login_student():
    response = client.post("/api/auth/login", json={
        "email": "student@college.edu",
        "password": "student123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"

def test_login_invalid_password():
    response = client.post("/api/auth/login", json={
        "email": "admin@queuesense.ai",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_register_duplicate_email():
    response = client.post("/api/auth/register", json={
        "name": "Another Admin",
        "email": "admin@queuesense.ai",
        "password": "somepassword123"
    })
    assert response.status_code == 400
