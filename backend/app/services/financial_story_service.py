"""
Financial Story Service - Sprint 3
Orchestrates narrative generation from ML outputs.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.feature_engineering import financial_features
from app.ml.financial_health_engine import financial_health_engine
from app.ml.financial_story_generator import financial_story_generator
from app.ml.inference import credit_scoring_engine
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint3 import FinancialStoryResponse, StorySegment


class FinancialStoryService:
    def get_financial_story(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> FinancialStoryResponse:
        self._authorize(current_user, user_id)
        transactions = self._transactions_for_user(db, user_id)
        feature_set = financial_features.financial_feature_engineer.generate(transactions)
        score_result = credit_scoring_engine.score(feature_set)
        dims = financial_health_engine.compute(feature_set)
        generated_at = datetime.now(timezone.utc)

        story = financial_story_generator.generate(
            features=feature_set.features,
            credit_score=score_result.final_score,
            risk_level=score_result.risk_level,
            health_score=dims.health_score,
            monthly_cash_flow=feature_set.monthly_cash_flow,
            behavioral_indicators=feature_set.behavioral_indicators,
        )

        segments = [
            StorySegment(
                segment_type=seg.segment_type,  # type: ignore[arg-type]
                text=seg.text,
            )
            for seg in story.narrative_segments
        ]

        return FinancialStoryResponse(
            user_id=user_id,
            headline=story.headline,
            narrative_segments=segments,
            full_narrative=story.full_narrative,
            credit_score=score_result.final_score,
            risk_level=score_result.risk_level,
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
                detail="Users can only access their own financial story",
            )


financial_story_service = FinancialStoryService()
