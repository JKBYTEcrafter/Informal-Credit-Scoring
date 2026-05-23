from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

Priority = Literal["High", "Medium", "Low"]
Severity = Literal["Critical", "Warning", "Info"]


# ---------------------------------------------------------------------------
# Financial Health Report
# ---------------------------------------------------------------------------


class HealthDimension(BaseModel):
    label: str
    score: int = Field(ge=0, le=100)
    description: str


class FinancialHealthReportResponse(BaseModel):
    user_id: int
    health_score: int = Field(ge=0, le=100)
    stability_score: int = Field(ge=0, le=100)
    volatility_score: int = Field(ge=0, le=100)
    cash_flow_health: int = Field(ge=0, le=100)
    savings_discipline_score: int = Field(ge=0, le=100)
    expense_management_score: int = Field(ge=0, le=100)
    income_reliability_score: int = Field(ge=0, le=100)
    dimensions: list[HealthDimension]
    percentile_benchmarks: dict[str, float]
    generated_at: datetime


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------


class RecommendationItem(BaseModel):
    id: int
    recommendation: str
    priority: Priority
    category: str
    generated_at: datetime


class RecommendationsResponse(BaseModel):
    user_id: int
    recommendations: list[RecommendationItem]
    total_count: int
    high_priority_count: int


# ---------------------------------------------------------------------------
# Behavioral Analysis
# ---------------------------------------------------------------------------


class BehavioralInsightItem(BaseModel):
    insight_type: str
    insight_description: str
    severity: Severity


class SpenderProfile(BaseModel):
    profile_label: str
    profile_description: str
    risk_flags: list[str]
    strengths: list[str]


class BehavioralAnalysisResponse(BaseModel):
    user_id: int
    spender_profile: SpenderProfile
    insights: list[BehavioralInsightItem]
    spending_patterns: dict[str, Any]
    merchant_concentration: list[dict[str, Any]]
    category_risk_breakdown: list[dict[str, Any]]
    generated_at: datetime


# ---------------------------------------------------------------------------
# Risk Trends
# ---------------------------------------------------------------------------


class RiskTrendPoint(BaseModel):
    month: str
    credit_score: float
    health_score: int
    risk_level: str
    savings_ratio: float
    spending_volatility: float


class RiskTrendsResponse(BaseModel):
    user_id: int
    trend_points: list[RiskTrendPoint]
    score_change_6m: float
    trend_direction: Literal["Improving", "Declining", "Stable"]
    best_month: str | None
    worst_month: str | None


# ---------------------------------------------------------------------------
# Financial Story
# ---------------------------------------------------------------------------


class StorySegment(BaseModel):
    segment_type: Literal["header", "positive", "warning", "neutral", "recommendation"]
    text: str


class FinancialStoryResponse(BaseModel):
    user_id: int
    headline: str
    narrative_segments: list[StorySegment]
    full_narrative: str
    credit_score: float
    risk_level: str
    generated_at: datetime


# ---------------------------------------------------------------------------
# Explainability
# ---------------------------------------------------------------------------


class SHAPValue(BaseModel):
    feature: str
    shap_value: float
    feature_value: float
    impact: Literal["positive", "negative", "neutral"]
    readable_label: str


class ExplainabilityResponse(BaseModel):
    user_id: int
    credit_score: float
    risk_level: str
    base_score: float
    shap_values: list[SHAPValue]
    top_positive_factors: list[str]
    top_negative_factors: list[str]
    financial_health_score: int
    explanation_method: str
    generated_at: datetime


# ---------------------------------------------------------------------------
# Advanced Dashboard Summary
# ---------------------------------------------------------------------------


class AdvancedSummaryResponse(BaseModel):
    user_id: int
    credit_score: float
    risk_level: str
    health_report: FinancialHealthReportResponse
    top_recommendations: list[RecommendationItem]
    spender_profile: SpenderProfile
    risk_trend_direction: str
    score_change_6m: float
    financial_story_headline: str
    key_insights: list[BehavioralInsightItem]
    generated_at: datetime
