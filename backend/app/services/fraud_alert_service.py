from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.config.settings import get_settings
from app.ml.fraud_detection.anomaly_detector import fraud_anomaly_detector
from app.ml.fraud_detection.fraud_feature_engineer import fraud_feature_engineer
from app.ml.fraud_detection.fraud_scorer import fraud_scoring_engine, FraudScoringResult
from app.models.fraud_alert import FraudAlert
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint4 import FraudAlertItem, FraudAlertsResponse
from app.services.fraud_score_service import fraud_score_service

# Severity thresholds
_CRITICAL = 0.80
_HIGH = 0.60
_MEDIUM = 0.35

# Alert rule: (feature_key, threshold, alert_type, description_template)
_ALERT_RULES: list[tuple[str, float, str, str]] = [
    (
        "transaction_velocity",
        0.20,
        "velocity_anomaly",
        "Abnormal transaction velocity detected — account activity is significantly above normal levels.",
    ),
    (
        "spending_spike_ratio",
        0.50,
        "spending_spike",
        "Sudden spending spike detected — a single day's expenditure is unusually high compared to the average.",
    ),
    (
        "merchant_concentration_score",
        0.70,
        "merchant_concentration",
        "Excessive merchant concentration — the majority of transactions flow to a single merchant.",
    ),
    (
        "nighttime_transaction_ratio",
        0.30,
        "nighttime_activity",
        "High volume of late-night transactions detected — potential indicator of unauthorised access.",
    ),
    (
        "behavioral_fingerprint_deviation",
        0.55,
        "behavioral_deviation",
        "Significant deviation from established behavioral patterns — account activity does not match historical profile.",
    ),
    (
        "round_number_ratio",
        0.65,
        "round_number_pattern",
        "High proportion of round-number transactions detected — may indicate structured or synthetic transactions.",
    ),
    (
        "rapid_balance_depletion",
        0.45,
        "rapid_depletion",
        "Rapid account balance depletion — a single withdrawal exceeds a large portion of monthly income.",
    ),
]


def _severity_from_score(score: float) -> str:
    if score >= _CRITICAL:
        return "Critical"
    if score >= _HIGH:
        return "High"
    if score >= _MEDIUM:
        return "Medium"
    return "Low"


class FraudAlertService:
    """
    Rule-based fraud alert generator.
    Uses fraud features and fraud probability to generate targeted alerts.
    """

    def get_fraud_alerts(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> FraudAlertsResponse:
        self._authorize(current_user, user_id)
        settings = get_settings()
        model_dir = Path(settings.FRAUD_MODEL_DIR)

        # Recompute features + score (lightweight, no extra DB write)
        from sqlalchemy import select

        txn_stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.timestamp.asc())
        )
        transactions = list(db.scalars(txn_stmt).all())

        feature_set = fraud_feature_engineer.generate(transactions)
        anomaly_result = fraud_anomaly_detector.detect(feature_set, model_dir)
        score_result = fraud_scoring_engine.score(feature_set, anomaly_result)

        generated_at = datetime.now(timezone.utc)
        alert_records: list[FraudAlert] = []

        for feature_key, threshold, alert_type, description in _ALERT_RULES:
            value = feature_set.features.get(feature_key, 0.0)
            if value > threshold:
                # Risk score is weighted combination of feature value and overall fraud probability
                risk_score = min((value + score_result.fraud_probability) / 2.0, 1.0)
                severity = _severity_from_score(risk_score)

                record = FraudAlert(
                    user_id=user_id,
                    alert_type=alert_type,
                    severity=severity,
                    description=description,
                    risk_score=risk_score,
                )
                db.add(record)
                alert_records.append(record)

        if alert_records:
            db.commit()
            for rec in alert_records:
                db.refresh(rec)

        # Sort by severity (Critical > High > Medium > Low)
        _severity_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
        alert_records.sort(key=lambda r: _severity_order.get(r.severity, 99))

        items = [
            FraudAlertItem(
                id=rec.id,
                alert_type=rec.alert_type,
                severity=rec.severity,  # type: ignore[arg-type]
                description=rec.description,
                risk_score=float(rec.risk_score),
                generated_at=generated_at,
            )
            for rec in alert_records
        ]

        return FraudAlertsResponse(
            user_id=user_id,
            alerts=items,
            total_count=len(items),
            critical_count=sum(1 for a in items if a.severity == "Critical"),
            high_count=sum(1 for a in items if a.severity == "High"),
        )

    def _authorize(self, current_user: User, user_id: int) -> None:
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only access their own fraud data",
            )


fraud_alert_service = FraudAlertService()
