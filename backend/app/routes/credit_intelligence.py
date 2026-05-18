from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.credit_intelligence import (
    CreditScoreResponse,
    FinancialHealthResponse,
    RiskAnalysisResponse,
)
from app.services.credit_intelligence_service import credit_intelligence_service

router = APIRouter(tags=["Credit Intelligence"])


@router.get("/credit-score/{user_id}", response_model=CreditScoreResponse)
def credit_score(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CreditScoreResponse:
    return credit_intelligence_service.get_credit_score(db, current_user, user_id)


@router.get("/risk-analysis/{user_id}", response_model=RiskAnalysisResponse)
def risk_analysis(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RiskAnalysisResponse:
    return credit_intelligence_service.get_risk_analysis(db, current_user, user_id)


@router.get("/financial-health/{user_id}", response_model=FinancialHealthResponse)
def financial_health(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FinancialHealthResponse:
    return credit_intelligence_service.get_financial_health(db, current_user, user_id)
