"""
Trend Analytics Service - Sprint 3
Slices historical transactions month-by-month to generate
credit score and health evolution timelines.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.evaluation import classify_score
from app.ml.feature_engineering import financial_features
from app.ml.financial_health_engine import financial_health_engine
from app.ml.inference import credit_scoring_engine
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint3 import RiskTrendPoint, RiskTrendsResponse


class TrendAnalyticsService:
    def get_risk_trends(
        self,
        db: Session,
        current_user: User,
        user_id: int,
        months: int = 6,
    ) -> RiskTrendsResponse:
        self._authorize(current_user, user_id)
        all_transactions = self._transactions_for_user(db, user_id)

        trend_points = self._compute_monthly_trends(all_transactions, months)

        if not trend_points:
            return RiskTrendsResponse(
                user_id=user_id,
                trend_points=[],
                score_change_6m=0.0,
                trend_direction="Stable",
                best_month=None,
                worst_month=None,
            )

        scores = [p.credit_score for p in trend_points]
        score_change = round(scores[-1] - scores[0], 2) if len(scores) >= 2 else 0.0

        if score_change > 10:
            direction = "Improving"
        elif score_change < -10:
            direction = "Declining"
        else:
            direction = "Stable"

        best = max(trend_points, key=lambda p: p.credit_score)
        worst = min(trend_points, key=lambda p: p.credit_score)

        return RiskTrendsResponse(
            user_id=user_id,
            trend_points=trend_points,
            score_change_6m=score_change,
            trend_direction=direction,  # type: ignore[arg-type]
            best_month=best.month,
            worst_month=worst.month,
        )

    def _compute_monthly_trends(
        self,
        transactions: list[Transaction],
        months: int,
    ) -> list[RiskTrendPoint]:
        if not transactions:
            return []

        # Group transactions by YYYY-MM month label
        month_map: dict[str, list[Transaction]] = {}
        for txn in transactions:
            ts = txn.timestamp
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts)
            label = ts.strftime("%Y-%m") if ts else "unknown"
            month_map.setdefault(label, []).append(txn)

        sorted_months = sorted(month_map.keys())[-months:]
        trend_points: list[RiskTrendPoint] = []

        # Use cumulative slices (up to and including each month) for realism
        for i, month_label in enumerate(sorted_months):
            months_so_far = sorted_months[: i + 1]
            cumulative = [
                txn for m in months_so_far for txn in month_map[m]
            ]
            try:
                feature_set = financial_features.financial_feature_engineer.generate(cumulative)
                score = credit_scoring_engine.score(feature_set)
                dims = financial_health_engine.compute(feature_set)
                trend_points.append(
                    RiskTrendPoint(
                        month=month_label,
                        credit_score=round(score.final_score, 2),
                        health_score=dims.health_score,
                        risk_level=score.risk_level,
                        savings_ratio=round(feature_set.features["savings_ratio"], 4),
                        spending_volatility=round(feature_set.features["spending_volatility"], 4),
                    )
                )
            except Exception:  # noqa: BLE001
                continue

        return trend_points

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
                detail="Users can only access their own risk trends",
            )


trend_analytics_service = TrendAnalyticsService()
