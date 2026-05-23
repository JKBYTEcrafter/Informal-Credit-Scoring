from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class FinancialHealthReport(Base):
    __tablename__ = "financial_health_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    health_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    stability_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    volatility_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    cash_flow_health: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    savings_discipline_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    expense_management_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    income_reliability_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="financial_health_reports")
