import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_route_happy_path():
    payload = {
        "user_id": "test_user_123",
        "latitude": 41.0082,
        "longitude": 28.9784,
        "vehicle_type": "Sedan",
        "issue_type": "Flat Tire"
    }
    response = client.post("/api/v1/route", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "route_id" in data
    assert "assigned_partner_id" in data
    assert "estimated_arrival_minutes" in data
    assert "distance_km" in data
    assert isinstance(data["estimated_arrival_minutes"], int)
    assert isinstance(data["distance_km"], float)

def test_route_missing_fields():
    payload = {
        "user_id": "test_user_123",
        "latitude": 41.0082
        # Missing longitude, vehicle_type, issue_type
    }
    response = client.post("/api/v1/route", json=payload)
    assert response.status_code == 422
    data = response.json()
    # Check that FastAPI validation errors are returned for missing fields
    assert "detail" in data
    missing_fields = [error["loc"][-1] for error in data["detail"]]
    assert "longitude" in missing_fields
    assert "vehicle_type" in missing_fields
    assert "issue_type" in missing_fields

def test_route_invalid_data_types():
    payload = {
        "user_id": "test_user_123",
        "latitude": "invalid_latitude", # Should be float
        "longitude": "invalid_longitude", # Should be float
        "vehicle_type": "Sedan",
        "issue_type": "Flat Tire"
    }
    response = client.post("/api/v1/route", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    error_fields = [error["loc"][-1] for error in data["detail"]]
    assert "latitude" in error_fields
    assert "longitude" in error_fields
