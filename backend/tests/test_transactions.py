from fastapi.testclient import TestClient


CSV_CONTENT = """amount,type,merchant,category,timestamp
1200,credit,Salary,income,2026-05-18
300,debit,Amazon,shopping,2026-05-18
"""


def test_csv_upload_persists_transactions(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    response = client.post(
        "/api/transactions/upload",
        headers=auth_headers,
        files={"file": ("transactions.csv", CSV_CONTENT, "text/csv")},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["imported_count"] == 2
    assert payload["transactions"][0]["merchant"] == "Salary"


def test_fetch_transactions_returns_user_records(
    client: TestClient,
    auth_headers: dict[str, str],
) -> None:
    client.post(
        "/api/transactions/upload",
        headers=auth_headers,
        files={"file": ("transactions.csv", CSV_CONTENT, "text/csv")},
    )

    response = client.get("/api/transactions", headers=auth_headers)

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_invalid_csv_is_rejected(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.post(
        "/api/transactions/upload",
        headers=auth_headers,
        files={"file": ("transactions.csv", "amount,type\n0,refund\n", "text/csv")},
    )

    assert response.status_code == 422
