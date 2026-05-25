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
from app.models.risk_event import RiskEvent
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint4 import RiskEventItem, RiskEventsResponse


class RiskEventService:
    """
    Records a RiskEvent every time a fraud score is computed and
    retrieves the most recent 20 events for a user.
    """

    def get_risk_events(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> RiskEventsResponse:
        self._authorize(current_user, user_id)
        settings = get_settings()
        model_dir = Path(settings.FRAUD_MODEL_DIR)

        # Compute latest fraud score to record a new event
        transactions = self._get_transactions(db, user_id)
        feature_set = fraud_feature_engineer.generate(transactions)
        anomaly_result = fraud_anomaly_detector.detect(feature_set, model_dir)
        score_result = fraud_scoring_engine.score(feature_set, anomaly_result)

        event_metadata = {
            "risk_level": score_result.risk_level,
            "anomaly_score": score_result.anomaly_score,
            "rule_score": score_result.rule_score,
            "transaction_count": feature_set.transaction_count,
            "top_risk_factors": score_result.top_risk_factors,
        }

        new_event = RiskEvent(
            user_id=user_id,
            event_type="fraud_score_computation",
            event_score=score_result.fraud_probability,
            metadata_json=json.dumps(event_metadata),
        )
        db.add(new_event)
        db.commit()
        db.refresh(new_event)

        # Fetch last 20 events
        stmt = (
            select(RiskEvent)
            .where(RiskEvent.user_id == user_id)
            .order_by(RiskEvent.created_at.desc())
            .limit(20)
        )
        events = list(db.scalars(stmt).all())

        items = []
        for ev in events:
            try:
                meta = json.loads(ev.metadata_json) if ev.metadata_json else {}
            except (json.JSONDecodeError, TypeError):
                meta = {}

            created_at = ev.created_at
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)

            items.append(
                RiskEventItem(
                    id=ev.id,
                    event_type=ev.event_type,
                    event_score=ev.event_score,
                    metadata=meta,
                    created_at=created_at,
                )
            )

        return RiskEventsResponse(
            user_id=user_id,
            events=items,
            total_count=len(items),
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
                detail="Users can only access their own risk event data",
            )


risk_event_service = RiskEventService()
