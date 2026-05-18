from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

RiskLevel = Literal["Low Risk", "Medium Risk", "High Risk"]


class ExplanationItem(BaseModel):
    feature: str
    impact: Literal["positive", "negative", "neutral"]
    message: str


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    method: str


class CategoryDistributionItem(BaseModel):
    category: str
    total_spent: float
    ratio: float


class MonthlyCashFlowPoint(BaseModel):
    month: str
    income: float
    expenses: float
    net_cash_flow: float


class CreditScoreResponse(BaseModel):
    user_id: int
    score: float = Field(ge=300, le=900)
    risk_level: RiskLevel
    model_version: str
    model_name: str
    generated_at: datetime
    score_breakdown: dict[str, float]
    explanations: list[ExplanationItem]
    feature_importance: list[FeatureImportanceItem]


class RiskAnalysisResponse(BaseModel):
    user_id: int
    score: float = Field(ge=300, le=900)
    risk_level: RiskLevel
    band: str
    key_risk_factors: list[ExplanationItem]
    protective_factors: list[ExplanationItem]
    generated_at: datetime


class FinancialHealthResponse(BaseModel):
    user_id: int
    health_score: int = Field(ge=0, le=100)
    features: dict[str, float]
    behavioral_indicators: dict[str, float]
    category_distribution: list[CategoryDistributionItem]
    monthly_cash_flow: list[MonthlyCashFlowPoint]
    categorical_profile: dict[str, str]
    generated_at: datetime


class ModelRetrainRequest(BaseModel):
    n_samples: int = Field(default=1200, ge=300, le=50_000)
    include_optional_models: bool = True
    tune_hyperparameters: bool = False


class ModelRetrainResponse(BaseModel):
    model_version: str
    model_name: str
    created_at: str
    metrics: dict[str, Any]
    model_comparison: list[dict[str, Any]]
    training_metadata: dict[str, Any]
    feature_schema: dict[str, list[str]]


class ModelMetricsResponse(BaseModel):
    model_version: str
    model_name: str
    created_at: str | None
    metrics: dict[str, Any]
    model_comparison: list[dict[str, Any]]
    training_metadata: dict[str, Any]
    feature_schema: dict[str, list[str]]
