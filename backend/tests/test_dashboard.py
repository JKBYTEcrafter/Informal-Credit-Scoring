from fastapi.testclient import TestClient


def test_dashboard_summary_calculates_financial_metrics(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    csv_content = """amount,type,merchant,category,timestamp
45000,credit,Salary,income,2026-05-18
15000,debit,Rent,housing,2026-05-18
12000,debit,UPI Groceries,food,2026-05-18
"""
    client.post(
        "/api/transactions/upload",
        headers=auth_headers,
        files={"file": ("transactions.csv", csv_content, "text/csv")},
    )

    response = client.get("/api/dashboard/summary", headers=auth_headers)

    assert response.status_code == 200
    assert response.json() == {
        "total_income": 45000.0,
        "total_expenses": 27000.0,
        "savings_ratio": 0.4,
        "transaction_count": 3,
    }
