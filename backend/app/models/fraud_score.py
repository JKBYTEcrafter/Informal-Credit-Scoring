from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class FraudScore(Base):
    __tablename__ = "fraud_scores"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    fraud_probability: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    risk_level: Mapped[str] = mapped_column(String(32), nullable=False)
    anomaly_score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False, default=0)
    confidence_score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False, default=0)
    model_version: Mapped[str] = mapped_column(String(64), nullable=False, default="heuristic-v1")
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
