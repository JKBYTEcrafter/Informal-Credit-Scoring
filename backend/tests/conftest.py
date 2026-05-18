import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["AUTO_CREATE_TABLES"] = "False"
os.environ["JWT_SECRET_KEY"] = "test-secret-key"
os.environ["ML_MODEL_DIR"] = "C:/tmp/alternative_credit_test_models"

from app.database.base import Base  # noqa: E402
from app.database.session import get_db  # noqa: E402
from app.main import create_app  # noqa: E402

TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Aarav Sharma",
            "email": "aarav@example.com",
            "password": "StrongPass123",
            "occupation": "Retail owner",
            "monthly_income": "45000",
        },
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
