"""
Advanced Intelligence Service - Sprint 3
Aggregates all Sprint 3 intelligence services into a single optimized
dashboard summary response to minimize frontend round-trips.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.behavioral_analytics_engine import behavioral_analytics_engine
from app.ml.feature_engineering import financial_features
from app.ml.financial_health_engine import financial_health_engine
from app.ml.financial_story_generator import financial_story_generator
from app.ml.inference import credit_scoring_engine
from app.ml.recommendation_engine import recommendation_engine
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint3 import (
    AdvancedSummaryResponse,
    BehavioralInsightItem,
    FinancialHealthReportResponse,
    HealthDimension,
    RecommendationItem,
    SpenderProfile,
)


class AdvancedIntelligenceService:
    def get_advanced_summary(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> AdvancedSummaryResponse:
        self._authorize(current_user, user_id)
        transactions = self._transactions_for_user(db, user_id)
        feature_set = financial_features.financial_feature_engineer.generate(transactions)
        score_result = credit_scoring_engine.score(feature_set)
        dims = financial_health_engine.compute(feature_set)
        recommendations = recommendation_engine.generate(feature_set, score_result.final_score)
        behavioral = behavioral_analytics_engine.analyze(feature_set)
        story = financial_story_generator.generate(
            features=feature_set.features,
            credit_score=score_result.final_score,
            risk_level=score_result.risk_level,
            health_score=dims.health_score,
            monthly_cash_flow=feature_set.monthly_cash_flow,
            behavioral_indicators=feature_set.behavioral_indicators,
        )
        generated_at = datetime.now(timezone.utc)

        # Build health report
        dimension_labels = [
            ("Income Reliability", dims.income_reliability_score, "Consistency of income sources"),
            ("Savings Discipline", dims.savings_discipline_score, "Ability to save consistently"),
            ("Expense Management", dims.expense_management_score, "Control over spending"),
            ("Cash Flow Health", dims.cash_flow_health, "Net monthly cash position"),
            ("Financial Stability", dims.stability_score, "Overall pattern consistency"),
            ("Volatility Control", dims.volatility_score, "Avoiding spending swings"),
        ]
        health_dimensions = [
            HealthDimension(label=l, score=s, description=d) for l, s, d in dimension_labels
        ]

        health_report = FinancialHealthReportResponse(
            user_id=user_id,
            health_score=dims.health_score,
            stability_score=dims.stability_score,
            volatility_score=dims.volatility_score,
            cash_flow_health=dims.cash_flow_health,
            savings_discipline_score=dims.savings_discipline_score,
            expense_management_score=dims.expense_management_score,
            income_reliability_score=dims.income_reliability_score,
            dimensions=health_dimensions,
            percentile_benchmarks=dims.percentile_benchmarks,
            generated_at=generated_at,
        )

        # Top 3 recommendations
        top_recs = [
            RecommendationItem(
                id=i + 1,
                recommendation=rec.recommendation,
                priority=rec.priority,  # type: ignore[arg-type]
                category=rec.category,
                generated_at=generated_at,
            )
            for i, rec in enumerate(recommendations[:3])
        ]

        profile = behavioral.spender_profile
        spender = SpenderProfile(
            profile_label=profile.profile_label,
            profile_description=profile.profile_description,
            risk_flags=list(profile.risk_flags),
            strengths=list(profile.strengths),
        )

        key_insights = [
            BehavioralInsightItem(
                insight_type=ins.insight_type,
                insight_description=ins.insight_description,
                severity=ins.severity,  # type: ignore[arg-type]
            )
            for ins in behavioral.insights[:4]
        ]

        # Compute score change (single-period: no history, use 0)
        score_change = 0.0

        return AdvancedSummaryResponse(
            user_id=user_id,
            credit_score=score_result.final_score,
            risk_level=score_result.risk_level,
            health_report=health_report,
            top_recommendations=top_recs,
            spender_profile=spender,
            risk_trend_direction="Stable",
            score_change_6m=score_change,
            financial_story_headline=story.headline,
            key_insights=key_insights,
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
                detail="Users can only access their own intelligence data",
            )


advanced_intelligence_service = AdvancedIntelligenceService()
