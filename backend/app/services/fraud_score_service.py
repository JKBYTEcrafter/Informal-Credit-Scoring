from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.ml.fraud_detection.anomaly_detector import fraud_anomaly_detector
from app.ml.fraud_detection.fraud_feature_engineer import fraud_feature_engineer
from app.ml.fraud_detection.fraud_scorer import fraud_scoring_engine
from app.ml.fraud_detection.fraud_trainer import fraud_model_trainer
from app.models.fraud_score import FraudScore
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint4 import FraudScoreResponse


class FraudScoreService:
    """
    Orchestrates the full fraud scoring pipeline:
    1. Fetch transactions
    2. Extract fraud features
    3. Run anomaly detection
    4. Score and classify
    5. Persist result to DB
    """

    def get_fraud_score(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> FraudScoreResponse:
        self._authorize(current_user, user_id)
        settings = get_settings()
        model_dir = Path(settings.FRAUD_MODEL_DIR)

        transactions = self._get_transactions(db, user_id)
        feature_set = fraud_feature_engineer.generate(transactions)
        anomaly_result = fraud_anomaly_detector.detect(feature_set, model_dir)
        score_result = fraud_scoring_engine.score(feature_set, anomaly_result)

        metadata = fraud_model_trainer.load_metadata()
        model_version = metadata.get("model_version", "heuristic-v1")

        # Persist latest score
        fraud_score_record = FraudScore(
            user_id=user_id,
            fraud_probability=score_result.fraud_probability,
            risk_level=score_result.risk_level,
            anomaly_score=score_result.anomaly_score,
            confidence_score=score_result.confidence_score,
            model_version=model_version,
        )
        db.add(fraud_score_record)
        db.commit()
        db.refresh(fraud_score_record)

        return FraudScoreResponse(
            user_id=user_id,
            fraud_probability=score_result.fraud_probability,
            risk_level=score_result.risk_level,  # type: ignore[arg-type]
            anomaly_score=score_result.anomaly_score,
            confidence_score=score_result.confidence_score,
            top_risk_factors=score_result.top_risk_factors,
            model_version=model_version,
            model_name="Fraud Ensemble (IF + SVM + LOF)",
            generated_at=datetime.now(timezone.utc),
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_transactions(self, db: Session, user_id: int) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.timestamp.asc())
        )
        return list(db.scalars(stmt).all())

    def _authorize(self, current_user: User, user_id: int) -> None:
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only access their own fraud data",
            )


fraud_score_service = FraudScoreService()
