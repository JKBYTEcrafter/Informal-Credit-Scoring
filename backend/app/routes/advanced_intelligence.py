"""
Sprint 3 Advanced Intelligence Routes
Provides explainability, health reports, recommendations,
behavioral analysis, risk trends, financial story, and advanced summary.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.sprint3 import (
    AdvancedSummaryResponse,
    BehavioralAnalysisResponse,
    ExplainabilityResponse,
    FinancialHealthReportResponse,
    FinancialStoryResponse,
    RecommendationsResponse,
    RiskTrendsResponse,
)
from app.services.advanced_intelligence_service import advanced_intelligence_service
from app.services.behavioral_analytics_service import behavioral_analytics_service
from app.services.explainability_service import explainability_api_service
from app.services.financial_health_service import financial_health_service
from app.services.financial_story_service import financial_story_service
from app.services.recommendation_service import recommendation_service
from app.services.trend_analytics_service import trend_analytics_service

router = APIRouter(tags=["Advanced Intelligence"])


@router.get("/explainability/{user_id}", response_model=ExplainabilityResponse)
def get_explainability(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ExplainabilityResponse:
    """SHAP-based credit score explainability with waterfall values."""
    return explainability_api_service.get_explainability(db, current_user, user_id)


@router.get("/financial-health/{user_id}", response_model=FinancialHealthReportResponse)
def get_financial_health_report(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinancialHealthReportResponse:
    """Six-dimensional financial health report with percentile benchmarking."""
    return financial_health_service.get_health_report(db, current_user, user_id)


@router.get("/recommendations/{user_id}", response_model=RecommendationsResponse)
def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecommendationsResponse:
    """Personalized, prioritized financial improvement recommendations."""
    return recommendation_service.get_recommendations(db, current_user, user_id)


@router.get("/behavioral-analysis/{user_id}", response_model=BehavioralAnalysisResponse)
def get_behavioral_analysis(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BehavioralAnalysisResponse:
    """Spending pattern classification, insights, and category risk analysis."""
    return behavioral_analytics_service.get_behavioral_analysis(db, current_user, user_id)


@router.get("/risk-trends/{user_id}", response_model=RiskTrendsResponse)
def get_risk_trends(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RiskTrendsResponse:
    """Historical credit score and health evolution over 6 months."""
    return trend_analytics_service.get_risk_trends(db, current_user, user_id)


@router.get("/financial-story/{user_id}", response_model=FinancialStoryResponse)
def get_financial_story(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinancialStoryResponse:
    """AI-generated personalized financial narrative."""
    return financial_story_service.get_financial_story(db, current_user, user_id)


@router.get("/dashboard/advanced-summary/{user_id}", response_model=AdvancedSummaryResponse)
def get_advanced_summary(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AdvancedSummaryResponse:
    """
    Optimized single-call aggregator: returns health, recommendations,
    behavioral profile, insights, and story headline in one response.
    """
    return advanced_intelligence_service.get_advanced_summary(db, current_user, user_id)
