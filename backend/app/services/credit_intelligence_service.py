from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.feature_engineering import financial_features
from app.ml.inference import credit_scoring_engine
from app.models.credit_score import CreditScore
from app.models.financial_feature import FinancialFeature
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.credit_intelligence import (
    CreditScoreResponse,
    FinancialHealthResponse,
    RiskAnalysisResponse,
)


class CreditIntelligenceService:
    def get_credit_score(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> CreditScoreResponse:
        self._authorize(current_user, user_id)
        transactions = self._transactions_for_user(db, user_id)
        feature_set = financial_features.financial_feature_engineer.generate(transactions)
        score = credit_scoring_engine.score(feature_set)
        generated_at = datetime.now(timezone.utc)

        self._persist_feature_snapshot(db, user_id, feature_set.features, generated_at)
        score_record = CreditScore(
            user_id=user_id,
            score=Decimal(str(score.final_score)),
            risk_level=score.risk_level,
            model_version=score.model_version,
            generated_at=generated_at,
        )
        db.add(score_record)
        db.commit()
        db.refresh(score_record)

        return CreditScoreResponse(
            user_id=user_id,
            score=float(score_record.score),
            risk_level=score_record.risk_level,
            model_version=score.model_version,
            model_name=score.model_name,
            generated_at=score_record.generated_at,
            score_breakdown={
                "ml_prediction": score.ml_prediction,
                "behavioral_score": score.behavioral_score,
                "financial_health_score": score.financial_health_score,
            },
            explanations=score.explanations,
            feature_importance=score.feature_importance,
        )

    def get_risk_analysis(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> RiskAnalysisResponse:
        credit_score = self.get_credit_score(db, current_user, user_id)
        negative = [
            explanation
            for explanation in credit_score.explanations
            if explanation.impact == "negative"
        ]
        positive = [
            explanation
            for explanation in credit_score.explanations
            if explanation.impact == "positive"
        ]
        return RiskAnalysisResponse(
            user_id=user_id,
            score=credit_score.score,
            risk_level=credit_score.risk_level,
            band=self._risk_band_label(credit_score.score),
            key_risk_factors=negative,
            protective_factors=positive,
            generated_at=credit_score.generated_at,
        )

    def get_financial_health(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> FinancialHealthResponse:
        self._authorize(current_user, user_id)
        transactions = self._transactions_for_user(db, user_id)
        feature_set = financial_features.financial_feature_engineer.generate(transactions)
        score = credit_scoring_engine.score(feature_set)
        generated_at = datetime.now(timezone.utc)
        self._persist_feature_snapshot(db, user_id, feature_set.features, generated_at)
        db.commit()

        return FinancialHealthResponse(
            user_id=user_id,
            health_score=int(round(((score.final_score - 300) / 600) * 100)),
            features=feature_set.features,
            behavioral_indicators=feature_set.behavioral_indicators,
            category_distribution=feature_set.category_distribution,
            monthly_cash_flow=feature_set.monthly_cash_flow,
            categorical_profile=feature_set.categorical_features,
            generated_at=generated_at,
        )

    def _transactions_for_user(self, db: Session, user_id: int) -> list[Transaction]:
        statement = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.timestamp.asc(), Transaction.id.asc())
        )
        return list(db.scalars(statement).all())

    def _persist_feature_snapshot(
        self,
        db: Session,
        user_id: int,
        features: dict[str, float],
        generated_at: datetime,
    ) -> None:
        db.add_all(
            [
                FinancialFeature(
                    user_id=user_id,
                    feature_name=name,
                    feature_value=Decimal(str(value)),
                    generated_at=generated_at,
                )
                for name, value in features.items()
            ]
        )

    def _authorize(self, current_user: User, user_id: int) -> None:
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only access their own financial intelligence",
            )

    def _risk_band_label(self, score: float) -> str:
        if score >= 750:
            return "750-900"
        if score >= 600:
            return "600-749"
        return "300-599"


credit_intelligence_service = CreditIntelligenceService()
