from fastapi.testclient import TestClient


def _register(client: TestClient, email: str) -> tuple[int, dict[str, str]]:
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Sprint Two User",
            "email": email,
            "password": "StrongPass123",
            "occupation": "Retail owner",
            "monthly_income": "55000",
        },
    )
    payload = response.json()
    return payload["user"]["id"], {"Authorization": f"Bearer {payload['access_token']}"}


def test_credit_score_api_generates_persisted_score(client: TestClient) -> None:
    user_id, headers = _register(client, "score@example.com")
    client.post(
        "/api/transactions/upload",
        headers=headers,
        files={
            "file": (
                "transactions.csv",
                "\n".join(
                    [
                        "amount,type,merchant,category,timestamp",
                        "55000,credit,Salary,income,2026-01-01",
                        "56000,credit,Salary,income,2026-02-01",
                        "14000,debit,Rent,housing,2026-01-03",
                        "8000,debit,Groceries,food,2026-01-08",
                        "7800,debit,Groceries,food,2026-02-08",
                    ]
                ),
                "text/csv",
            )
        },
    )

    response = client.get(f"/api/credit-score/{user_id}", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert 300 <= payload["score"] <= 900
    assert payload["risk_level"] in {"Low Risk", "Medium Risk", "High Risk"}
    assert payload["explanations"]
    assert payload["feature_importance"]


def test_credit_intelligence_blocks_cross_user_access(client: TestClient) -> None:
    owner_id, _ = _register(client, "owner@example.com")
    _, other_headers = _register(client, "other@example.com")

    response = client.get(f"/api/financial-health/{owner_id}", headers=other_headers)

    assert response.status_code == 403


def test_financial_health_api_returns_dashboard_integrity_data(client: TestClient) -> None:
    user_id, headers = _register(client, "health@example.com")

    response = client.get(f"/api/financial-health/{user_id}", headers=headers)

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["behavioral_indicators"]) == {
        "financial_discipline_score",
        "impulsive_spending_score",
        "transaction_regularity_score",
        "recurring_income_confidence",
    }
    assert payload["health_score"] == 0


def test_model_metrics_endpoint_is_protected(client: TestClient) -> None:
    assert client.get("/api/ml/model-metrics").status_code == 401

    _, headers = _register(client, "metrics@example.com")
    response = client.get("/api/ml/model-metrics", headers=headers)

    assert response.status_code == 200
    assert response.json()["feature_schema"]["numeric"]
