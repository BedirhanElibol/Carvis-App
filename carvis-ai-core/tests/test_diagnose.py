import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_diagnose_vehicle_success(mocker):
    # Mock the Supabase DB client call: db.table().insert().execute()
    mock_db = mocker.patch("app.routers.diagnose.db")
    mock_table = mock_db.table.return_value
    mock_insert = mock_table.insert.return_value
    mock_execute = mock_insert.execute
    mock_execute.return_value = {"data": [{"id": "some_id"}]}

    payload = {
        "user_id": "user123",
        "description": "Car won't start"
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
    mock_execute.assert_called_once()

def test_diagnose_vehicle_db_error(mocker):
    # Mock the Supabase DB client call to raise an exception
    mock_db = mocker.patch("app.routers.diagnose.db")
    mock_table = mock_db.table.return_value
    mock_insert = mock_table.insert.return_value
    mock_execute = mock_insert.execute
    mock_execute.side_effect = Exception("Database down")

    payload = {
        "user_id": "user123",
        "description": "Car won't start"
    }

    response = client.post("/api/v1/diagnose", json=payload)

    # Despite the exception, it should still return a 200 with the diagnosis
    assert response.status_code == 200
    data = response.json()
    assert "diagnosis_id" in data
    assert "predicted_issue" in data
    assert "confidence_score" in data
    assert "recommended_action" in data
    assert "severity" in data

    mock_db.table.assert_called_once_with("ai_diagnostics")
    mock_execute.assert_called_once()
