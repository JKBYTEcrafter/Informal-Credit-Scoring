"""
Recommendation Service - Sprint 3
Generates and persists personalized recommendations.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.ml.feature_engineering import financial_features
from app.ml.inference import credit_scoring_engine
from app.ml.recommendation_engine import recommendation_engine
from app.models.recommendation import Recommendation
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint3 import RecommendationItem, RecommendationsResponse


class RecommendationService:
    def get_recommendations(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> RecommendationsResponse:
        self._authorize(current_user, user_id)
        transactions = self._transactions_for_user(db, user_id)
        feature_set = financial_features.financial_feature_engineer.generate(transactions)
        score = credit_scoring_engine.score(feature_set)
        generated_at = datetime.now(timezone.utc)

        entries = recommendation_engine.generate(feature_set, score.final_score)

        # Clear old recs and repersist fresh ones
        db.execute(delete(Recommendation).where(Recommendation.user_id == user_id))
        records = [
            Recommendation(
                user_id=user_id,
                recommendation=entry.recommendation,
                priority=entry.priority,
                category=entry.category,
                generated_at=generated_at,
            )
            for entry in entries
        ]
        db.add_all(records)
        db.commit()

        # Re-fetch with IDs
        stmt = (
            select(Recommendation)
            .where(Recommendation.user_id == user_id)
            .order_by(Recommendation.id.asc())
        )
        saved = list(db.scalars(stmt).all())

        items = [
            RecommendationItem(
                id=rec.id,
                recommendation=rec.recommendation,
                priority=rec.priority,  # type: ignore[arg-type]
                category=rec.category,
                generated_at=rec.generated_at,
            )
            for rec in saved
        ]

        return RecommendationsResponse(
            user_id=user_id,
            recommendations=items,
            total_count=len(items),
            high_priority_count=sum(1 for i in items if i.priority == "High"),
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
                detail="Users can only access their own recommendations",
            )


recommendation_service = RecommendationService()
