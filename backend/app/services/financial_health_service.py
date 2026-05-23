"""
Financial Health Service - Sprint 3
Orchestrates financial health computation, persistence, and API response.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.feature_engineering import financial_features
from app.ml.financial_health_engine import financial_health_engine
from app.models.financial_health_report import FinancialHealthReport
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint3 import FinancialHealthReportResponse, HealthDimension


class FinancialHealthService:
    def get_health_report(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> FinancialHealthReportResponse:
        self._authorize(current_user, user_id)
        transactions = self._transactions_for_user(db, user_id)
        feature_set = financial_features.financial_feature_engineer.generate(transactions)
        dims = financial_health_engine.compute(feature_set)
        generated_at = datetime.now(timezone.utc)

        # Persist snapshot
        report = FinancialHealthReport(
            user_id=user_id,
            health_score=dims.health_score,
            stability_score=dims.stability_score,
            volatility_score=dims.volatility_score,
            cash_flow_health=dims.cash_flow_health,
            savings_discipline_score=dims.savings_discipline_score,
            expense_management_score=dims.expense_management_score,
            income_reliability_score=dims.income_reliability_score,
            generated_at=generated_at,
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        dimensions = [
            HealthDimension(
                label="Income Reliability",
                score=dims.income_reliability_score,
                description="Consistency and predictability of your income sources",
            ),
            HealthDimension(
                label="Savings Discipline",
                score=dims.savings_discipline_score,
                description="Your ability to consistently save a portion of your income",
            ),
            HealthDimension(
                label="Expense Management",
                score=dims.expense_management_score,
                description="How well you control and allocate your spending",
            ),
            HealthDimension(
                label="Cash Flow Health",
                score=dims.cash_flow_health,
                description="Stability and growth of your monthly net cash position",
            ),
            HealthDimension(
                label="Financial Stability",
                score=dims.stability_score,
                description="Overall consistency of income and transaction patterns",
            ),
            HealthDimension(
                label="Volatility Control",
                score=dims.volatility_score,
                description="Ability to avoid large unexpected spending swings",
            ),
        ]

        return FinancialHealthReportResponse(
            user_id=user_id,
            health_score=dims.health_score,
            stability_score=dims.stability_score,
            volatility_score=dims.volatility_score,
            cash_flow_health=dims.cash_flow_health,
            savings_discipline_score=dims.savings_discipline_score,
            expense_management_score=dims.expense_management_score,
            income_reliability_score=dims.income_reliability_score,
            dimensions=dimensions,
            percentile_benchmarks=dims.percentile_benchmarks,
            generated_at=generated_at,
        )

    def _transactions_for_user(self, db: Session, user_id: int) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.timestamp.asc(), Transaction.id.asc())
        )
        return list(db.scalars(stmt).all())

    def _authorize(self, current_user: User, user_id: int) -> None:
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only access their own financial data",
            )


financial_health_service = FinancialHealthService()
