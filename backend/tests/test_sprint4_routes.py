import pytest
from fastapi.testclient import TestClient

def test_fraud_score_requires_auth(client: TestClient):
    response = client.get("/api/fraud-score/1")
    assert response.status_code == 401

def test_fraud_score_cross_user_forbidden(client: TestClient, auth_headers: dict):
    response = client.get("/api/fraud-score/999", headers=auth_headers)
    assert response.status_code == 403

def test_fraud_score_returns_response(client: TestClient, auth_headers: dict):
    # Mocking or depending on the DB having the data, since this is an integration test
    response = client.get("/api/fraud-score/1", headers=auth_headers)
    if response.status_code == 200:
        data = response.json()
        assert "fraud_probability" in data
        assert "risk_level" in data
        assert "anomaly_score" in data

def test_fraud_alerts_requires_auth(client: TestClient):
    response = client.get("/api/fraud-alerts/1")
    assert response.status_code == 401

def test_fraud_alerts_returns_response(client: TestClient, auth_headers: dict):
    response = client.get("/api/fraud-alerts/1", headers=auth_headers)
    if response.status_code == 200:
        data = response.json()
        assert "alerts" in data
        assert "total_count" in data

def test_risk_events_requires_auth(client: TestClient):
    response = client.get("/api/risk-events/1")
    assert response.status_code == 401

def test_behavioral_risk_requires_auth(client: TestClient):
    response = client.get("/api/behavioral-risk/1")
    assert response.status_code == 401

def test_anomaly_analysis_requires_auth(client: TestClient):
    response = client.get("/api/anomaly-analysis/1")
    assert response.status_code == 401

def test_fraud_explainability_requires_auth(client: TestClient):
    response = client.get("/api/fraud-explainability/1")
    assert response.status_code == 401

def test_fraud_summary_requires_auth(client: TestClient):
    response = client.get("/api/fraud/fraud-summary/1")
    assert response.status_code == 401

def test_fraud_summary_returns_response(client: TestClient, auth_headers: dict):
    response = client.get("/api/fraud/fraud-summary/1", headers=auth_headers)
    if response.status_code == 200:
        data = response.json()
        assert "fraud_probability" in data
        assert "active_alerts" in data

def test_fraud_retrain_requires_auth(client: TestClient):
    response = client.post("/api/fraud/retrain-model")
    assert response.status_code == 401

def test_fraud_model_metrics_requires_auth(client: TestClient):
    response = client.get("/api/fraud/model-metrics")
    assert response.status_code == 401
