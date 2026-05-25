from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

FraudRiskLevel = Literal["Low Risk", "Medium Risk", "High Risk", "Critical Risk"]
AlertSeverity = Literal["Critical", "High", "Medium", "Low"]


# ---------------------------------------------------------------------------
# Fraud Score
# ---------------------------------------------------------------------------


class FraudScoreResponse(BaseModel):
    user_id: int
    fraud_probability: float = Field(ge=0.0, le=1.0)
    risk_level: FraudRiskLevel
    anomaly_score: float = Field(ge=0.0, le=1.0)
    confidence_score: float = Field(ge=0.0, le=1.0)
    top_risk_factors: list[str]
    model_version: str
    model_name: str
    generated_at: datetime


# ---------------------------------------------------------------------------
# Fraud Alerts
# ---------------------------------------------------------------------------


class FraudAlertItem(BaseModel):
    id: int
    alert_type: str
    severity: AlertSeverity
    description: str
    risk_score: float
    generated_at: datetime


class FraudAlertsResponse(BaseModel):
    user_id: int
    alerts: list[FraudAlertItem]
    total_count: int
    critical_count: int
    high_count: int


# ---------------------------------------------------------------------------
# Risk Events
# ---------------------------------------------------------------------------


class RiskEventItem(BaseModel):
    id: int
    event_type: str
    event_score: float
    metadata: dict[str, Any]
    created_at: datetime


class RiskEventsResponse(BaseModel):
    user_id: int
    events: list[RiskEventItem]
    total_count: int


# ---------------------------------------------------------------------------
# Behavioral Risk
# ---------------------------------------------------------------------------


class BehavioralRiskItem(BaseModel):
    indicator: str
    score: float = Field(ge=0.0, le=1.0)
    risk_level: AlertSeverity
    description: str
    readable_label: str


class BehavioralRiskResponse(BaseModel):
    user_id: int
    overall_risk_score: float
    risk_level: FraudRiskLevel
    indicators: list[BehavioralRiskItem]
    generated_at: datetime


# ---------------------------------------------------------------------------
# Anomaly Analysis
# ---------------------------------------------------------------------------


class AnomalyDataPoint(BaseModel):
    date: str
    anomaly_score: float
    transaction_count: int
    total_amount: float
    is_anomalous: bool


class AnomalyAnalysisResponse(BaseModel):
    user_id: int
    anomaly_points: list[AnomalyDataPoint]
    overall_anomaly_score: float
    anomalous_day_count: int
    peak_anomaly_date: str | None
    generated_at: datetime


# ---------------------------------------------------------------------------
# Fraud Explainability
# ---------------------------------------------------------------------------


class FraudFeatureContribution(BaseModel):
    feature: str
    readable_label: str
    contribution: float
    feature_value: float
    impact: Literal["high_risk", "medium_risk", "low_risk"]
    explanation: str


class FraudExplainabilityResponse(BaseModel):
    user_id: int
    fraud_probability: float
    base_probability: float
    feature_contributions: list[FraudFeatureContribution]
    top_risk_factors: list[str]
    anomaly_reasoning: list[str]
    generated_at: datetime


# ---------------------------------------------------------------------------
# Fraud Summary
# ---------------------------------------------------------------------------


class FraudSummaryResponse(BaseModel):
    user_id: int
    fraud_probability: float
    risk_level: FraudRiskLevel
    active_alerts: int
    critical_alerts: int
    risk_events_count: int
    overall_anomaly_score: float
    top_risk_factors: list[str]
    generated_at: datetime


# ---------------------------------------------------------------------------
# Model Metrics
# ---------------------------------------------------------------------------


class FraudModelMetricsResponse(BaseModel):
    model_version: str
    model_name: str
    trained_at: str | None
    n_estimators: int
    contamination: float
    status: str
    metrics: dict[str, Any]
