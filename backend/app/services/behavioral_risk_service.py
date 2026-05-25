from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.ml.fraud_detection.anomaly_detector import fraud_anomaly_detector
from app.ml.fraud_detection.fraud_feature_engineer import fraud_feature_engineer
from app.ml.fraud_detection.fraud_scorer import fraud_scoring_engine
from app.models.behavioral_risk_profile import BehavioralRiskProfile
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint4 import BehavioralRiskItem, BehavioralRiskResponse


# Indicator definitions: (feature_key, readable_label, description)
_INDICATORS: list[tuple[str, str, str]] = [
    (
        "transaction_velocity",
        "Transaction Velocity",
        "Measures the frequency of transactions per day relative to normal patterns.",
    ),
    (
        "spending_spike_ratio",
        "Spending Spike",
        "Detects abnormal one-day spending spikes compared to the user's average.",
    ),
    (
        "merchant_concentration_score",
        "Merchant Concentration",
        "Evaluates how concentrated spending is at a single merchant.",
    ),
    (
        "nighttime_transaction_ratio",
        "Night-time Activity",
        "Tracks the proportion of transactions occurring during late-night hours.",
    ),
    (
        "category_drift_score",
        "Category Drift",
        "Measures shifts in spending category dominance over time.",
    ),
    (
        "merchant_novelty_score",
        "Merchant Novelty",
        "Tracks how often transactions occur with new, one-off merchants.",
    ),
    (
        "round_number_ratio",
        "Round Number Pattern",
        "Detects structured transaction amounts (multiples of 100 or 1000).",
    ),
    (
        "behavioral_fingerprint_deviation",
        "Behavioral Deviation",
        "Composite score measuring overall departure from established behavioral baseline.",
    ),
]

_SEVERITY_THRESHOLDS: list[tuple[float, str]] = [
    (0.70, "Critical"),
    (0.45, "High"),
    (0.25, "Medium"),
    (0.0, "Low"),
]


def _classify_severity(score: float) -> str:
    for threshold, label in _SEVERITY_THRESHOLDS:
        if score >= threshold:
            return label
    return "Low"


def _risk_level_from_overall(score: float) -> str:
    if score >= 0.80:
        return "Critical Risk"
    if score >= 0.60:
        return "High Risk"
    if score >= 0.35:
        return "Medium Risk"
    return "Low Risk"


class BehavioralRiskService:
    """
    Generates per-indicator behavioral risk assessment for a user.
    Uses the 15 fraud features to populate 8 human-readable risk indicators.
    """

    def get_behavioral_risk(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> BehavioralRiskResponse:
        self._authorize(current_user, user_id)
        settings = get_settings()
        model_dir = Path(settings.FRAUD_MODEL_DIR)

        transactions = self._get_transactions(db, user_id)
        feature_set = fraud_feature_engineer.generate(transactions)
        anomaly_result = fraud_anomaly_detector.detect(feature_set, model_dir)
        score_result = fraud_scoring_engine.score(feature_set, anomaly_result)

        indicators: list[BehavioralRiskItem] = []
        for feature_key, readable_label, description in _INDICATORS:
            score = feature_set.features.get(feature_key, 0.0)
            severity = _classify_severity(score)
            indicators.append(
                BehavioralRiskItem(
                    indicator=feature_key,
                    score=round(score, 4),
                    risk_level=severity,  # type: ignore[arg-type]
                    description=description,
                    readable_label=readable_label,
                )
            )

        # Persist indicator scores
        for item in indicators:
            record = BehavioralRiskProfile(
                user_id=user_id,
                risk_indicator=item.indicator,
                indicator_score=item.score,
            )
            db.add(record)
        db.commit()

        overall_score = score_result.fraud_probability
        risk_level = _risk_level_from_overall(overall_score)

        return BehavioralRiskResponse(
            user_id=user_id,
            overall_risk_score=round(overall_score, 4),
            risk_level=risk_level,  # type: ignore[arg-type]
            indicators=indicators,
            generated_at=datetime.now(timezone.utc),
        )

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
                detail="Users can only access their own behavioral risk data",
            )


behavioral_risk_service = BehavioralRiskService()
