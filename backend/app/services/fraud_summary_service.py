from sqlalchemy.orm import Session
from app.schemas.sprint4 import FraudSummaryResponse
from app.services.fraud_score_service import fraud_score_service
from app.services.fraud_alert_service import fraud_alert_service
from app.services.anomaly_analysis_service import anomaly_analysis_service
from app.services.risk_event_service import risk_event_service
from app.models.user import User
from datetime import datetime, timezone

class FraudSummaryService:
    def get_fraud_summary(self, db: Session, current_user: User, user_id: int) -> FraudSummaryResponse:
        score = fraud_score_service.get_fraud_score(db, current_user, user_id)
        alerts = fraud_alert_service.get_fraud_alerts(db, current_user, user_id)
        events = risk_event_service.get_risk_events(db, current_user, user_id)
        anomaly = anomaly_analysis_service.get_anomaly_analysis(db, current_user, user_id)
        
        return FraudSummaryResponse(
            user_id=user_id,
            fraud_probability=score.fraud_probability,
            risk_level=score.risk_level,
            active_alerts=alerts.total_count,
            critical_alerts=alerts.critical_count,
            risk_events_count=events.total_count,
            overall_anomaly_score=anomaly.overall_anomaly_score,
            top_risk_factors=score.top_risk_factors,
            generated_at=datetime.now(timezone.utc)
        )

fraud_summary_service = FraudSummaryService()
