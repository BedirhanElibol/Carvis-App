from fastapi.testclient import TestClient
from app.main import app
import pytest
from unittest.mock import patch, MagicMock

client = TestClient(app)

@patch("app.routers.diagnose.db")
def test_diagnose_vehicle_success(mock_db):
    mock_table = MagicMock()
    mock_db.table.return_value = mock_table
    mock_insert = MagicMock()
    mock_table.insert.return_value = mock_insert
    mock_insert.execute.return_value = None

    payload = {
        "user_id": "test_user_123",
        "description": "Araba çalışmıyor",
        "image_url": "http://example.com/image.png"
    }

    response = client.post("/api/v1/diagnose", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "diagnosis_id" in data
    assert "predicted_issue" in data
    assert "confidence_score" in data
    assert "recommended_action" in data
    assert "severity" in data

    mock_db.table.assert_called_once_with("ai_diagnostics")

    # Verify insert arguments
    insert_call_args = mock_table.insert.call_args[0][0]
    assert insert_call_args["user_id"] == "test_user_123"
    assert insert_call_args["description"] == "Araba çalışmıyor"
    assert insert_call_args["images"] == ["http://example.com/image.png"]
    assert insert_call_args["id"] == data["diagnosis_id"]

@patch("app.routers.diagnose.db")
def test_diagnose_vehicle_no_image(mock_db):
    mock_table = MagicMock()
    mock_db.table.return_value = mock_table
    mock_insert = MagicMock()
    mock_table.insert.return_value = mock_insert
    mock_insert.execute.return_value = None

    payload = {
        "user_id": "test_user_456",
        "description": "Lastik patladı"
    }

    response = client.post("/api/v1/diagnose", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "diagnosis_id" in data

    mock_db.table.assert_called_once_with("ai_diagnostics")
    insert_call_args = mock_table.insert.call_args[0][0]
    assert insert_call_args["user_id"] == "test_user_456"
    assert "images" not in insert_call_args

@patch("app.routers.diagnose.db")
def test_diagnose_vehicle_db_error(mock_db):
    mock_table = MagicMock()
    mock_db.table.return_value = mock_table
    mock_insert = MagicMock()
    mock_table.insert.return_value = mock_insert
    mock_insert.execute.side_effect = Exception("DB Insert Failed")

    payload = {
        "user_id": "test_user_123",
        "description": "Motor çok sıcak",
    }

    response = client.post("/api/v1/diagnose", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert "diagnosis_id" in data
    assert "predicted_issue" in data

    mock_db.table.assert_called_once_with("ai_diagnostics")
