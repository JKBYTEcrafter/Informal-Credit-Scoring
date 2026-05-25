from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
from app.schemas.sprint4 import (
    AnomalyAnalysisResponse,
    BehavioralRiskResponse,
    FraudAlertsResponse,
    FraudExplainabilityResponse,
    FraudModelMetricsResponse,
    FraudScoreResponse,
    FraudSummaryResponse,
    RiskEventsResponse,
)
from app.services.anomaly_analysis_service import anomaly_analysis_service
from app.services.behavioral_risk_service import behavioral_risk_service
from app.services.fraud_alert_service import fraud_alert_service
from app.services.fraud_explainability_service import fraud_explainability_service
from app.services.fraud_score_service import fraud_score_service
from app.services.fraud_summary_service import fraud_summary_service
from app.services.fraud_training_service import fraud_training_service
from app.services.risk_event_service import risk_event_service

router = APIRouter(tags=["fraud-intelligence"])

@router.get("/fraud-score/{user_id}", response_model=FraudScoreResponse)
def get_fraud_score(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return fraud_score_service.get_fraud_score(db, current_user, user_id)

@router.get("/fraud-alerts/{user_id}", response_model=FraudAlertsResponse)
def get_fraud_alerts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return fraud_alert_service.get_fraud_alerts(db, current_user, user_id)

@router.get("/risk-events/{user_id}", response_model=RiskEventsResponse)
def get_risk_events(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return risk_event_service.get_risk_events(db, current_user, user_id)

@router.get("/behavioral-risk/{user_id}", response_model=BehavioralRiskResponse)
def get_behavioral_risk(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return behavioral_risk_service.get_behavioral_risk(db, current_user, user_id)

@router.get("/anomaly-analysis/{user_id}", response_model=AnomalyAnalysisResponse)
def get_anomaly_analysis(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return anomaly_analysis_service.get_anomaly_analysis(db, current_user, user_id)

@router.get("/fraud-explainability/{user_id}", response_model=FraudExplainabilityResponse)
def get_fraud_explainability(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return fraud_explainability_service.get_fraud_explainability(db, current_user, user_id)

@router.get("/fraud/fraud-summary/{user_id}", response_model=FraudSummaryResponse)
def get_fraud_summary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return fraud_summary_service.get_fraud_summary(db, current_user, user_id)

@router.post("/fraud/retrain-model", response_model=Dict[str, Any])
def retrain_fraud_model(current_user: User = Depends(get_current_user)):
    return fraud_training_service.retrain_fraud_model()

@router.get("/fraud/model-metrics", response_model=FraudModelMetricsResponse)
def get_fraud_model_metrics(current_user: User = Depends(get_current_user)):
    return fraud_training_service.get_fraud_model_metrics()
