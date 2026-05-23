"""
Behavioral Analytics Service - Sprint 3
Orchestrates behavioral pattern classification and insight persistence.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.ml.behavioral_analytics_engine import behavioral_analytics_engine
from app.ml.feature_engineering import financial_features
from app.models.behavioral_insight import BehavioralInsight
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint3 import (
    BehavioralAnalysisResponse,
    BehavioralInsightItem,
    SpenderProfile,
)


class BehavioralAnalyticsService:
    def get_behavioral_analysis(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> BehavioralAnalysisResponse:
        self._authorize(current_user, user_id)
        transactions = self._transactions_for_user(db, user_id)
        feature_set = financial_features.financial_feature_engineer.generate(transactions)
        result = behavioral_analytics_engine.analyze(feature_set)
        generated_at = datetime.now(timezone.utc)

        # Persist insights
        db.execute(delete(BehavioralInsight).where(BehavioralInsight.user_id == user_id))
        db.add_all([
            BehavioralInsight(
                user_id=user_id,
                insight_type=insight.insight_type,
                insight_description=insight.insight_description,
                severity=insight.severity,
                generated_at=generated_at,
            )
            for insight in result.insights
        ])
        db.commit()

        profile = result.spender_profile
        insights = [
            BehavioralInsightItem(
                insight_type=insight.insight_type,
                insight_description=insight.insight_description,
                severity=insight.severity,  # type: ignore[arg-type]
            )
            for insight in result.insights
        ]

        return BehavioralAnalysisResponse(
            user_id=user_id,
            spender_profile=SpenderProfile(
                profile_label=profile.profile_label,
                profile_description=profile.profile_description,
                risk_flags=list(profile.risk_flags),
                strengths=list(profile.strengths),
            ),
            insights=insights,
            spending_patterns=result.spending_patterns,
            merchant_concentration=result.merchant_concentration,
            category_risk_breakdown=result.category_risk_breakdown,
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
                detail="Users can only access their own behavioral data",
            )


behavioral_analytics_service = BehavioralAnalyticsService()
