from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.credit_intelligence import (
    ModelMetricsResponse,
    ModelRetrainRequest,
    ModelRetrainResponse,
)
from app.services.model_training_service import model_training_service

router = APIRouter(prefix="/ml", tags=["ML Operations"])


@router.post("/retrain-model", response_model=ModelRetrainResponse)
def retrain_model(
    payload: ModelRetrainRequest | None = None,
    current_user: User = Depends(get_current_user),
) -> ModelRetrainResponse:
    _ = current_user
    return model_training_service.retrain(payload or ModelRetrainRequest())


@router.get("/model-metrics", response_model=ModelMetricsResponse)
def model_metrics(
    current_user: User = Depends(get_current_user),
) -> ModelMetricsResponse:
    _ = current_user
    return model_training_service.metrics()
