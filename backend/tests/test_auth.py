from fastapi.testclient import TestClient


def test_user_registration_returns_token(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Priya Nair",
            "email": "priya@example.com",
            "password": "StrongPass123",
            "occupation": "Freelancer",
            "monthly_income": "60000",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["token_type"] == "bearer"
    assert payload["access_token"]
    assert payload["user"]["email"] == "priya@example.com"


def test_duplicate_registration_is_rejected(client: TestClient) -> None:
    user = {
        "name": "Priya Nair",
        "email": "priya@example.com",
        "password": "StrongPass123",
        "occupation": "Freelancer",
        "monthly_income": "60000",
    }
    assert client.post("/api/auth/register", json=user).status_code == 201

    response = client.post("/api/auth/register", json=user)

    assert response.status_code == 409


def test_login_with_valid_credentials(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={
            "name": "Kabir Mehta",
            "email": "kabir@example.com",
            "password": "StrongPass123",
            "occupation": "Consultant",
            "monthly_income": "70000",
        },
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "kabir@example.com", "password": "StrongPass123"},
    )

    assert response.status_code == 200
    assert response.json()["access_token"]


def test_protected_route_requires_token(client: TestClient) -> None:
    response = client.get("/api/transactions")

    assert response.status_code == 401
