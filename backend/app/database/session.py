"""
MongoDB/Neon PostgreSQL flexible database adapter
Supports BOTH PostgreSQL (Neon - lifetime free) AND SQLite (local dev/test)
Primary recommendation: Neon.tech FREE tier (PostgreSQL, lifetime free, 0.5GB)

To switch databases, just change DATABASE_URL in .env:
  - Neon PostgreSQL: postgresql://user:pass@host/db?sslmode=require
  - SQLite (dev):    sqlite:///./app.db
  - Local Postgres:  postgresql+psycopg://user:pass@localhost:5432/db
"""
from collections.abc import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import Session, sessionmaker

from app.config.settings import get_settings
from app.database.base import Base

settings = get_settings()


def _build_engine():
    url = settings.DATABASE_URL

    # SQLite — for local dev / tests
    if url.startswith("sqlite"):
        return create_engine(
            url,
            pool_pre_ping=True,
            connect_args={"check_same_thread": False},
        )

    # Neon (serverless PostgreSQL) or standard PostgreSQL
    # Neon uses ?sslmode=require — handled by the URL itself
    kwargs = dict(
        pool_pre_ping=True,
        pool_size=3,
        max_overflow=2,
        pool_timeout=20,
        pool_recycle=300,
    )

    # Handle psycopg vs psycopg2 URLs
    if "postgresql://" in url and "psycopg" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg://", 1)

    return create_engine(url, **kwargs)


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Create all tables. Safe to call multiple times (CREATE TABLE IF NOT EXISTS).
    For production, consider Alembic migrations instead.
    """
    from app.models import (  # noqa: F401
        behavioral_insight,
        credit_score,
        financial_feature,
        financial_health_report,
        recommendation,
        transaction,
        user,
    )
    Base.metadata.create_all(bind=engine)
