from __future__ import annotations

from app.ml.training import credit_model_trainer
from app.schemas.credit_intelligence import (
    ModelMetricsResponse,
    ModelRetrainRequest,
    ModelRetrainResponse,
)


class ModelTrainingService:
    def retrain(self, payload: ModelRetrainRequest) -> ModelRetrainResponse:
        metadata = credit_model_trainer.train(
            n_samples=payload.n_samples,
            include_optional_models=payload.include_optional_models,
            tune_hyperparameters=payload.tune_hyperparameters,
        )
        return ModelRetrainResponse(**metadata)

    def metrics(self) -> ModelMetricsResponse:
        return ModelMetricsResponse(**credit_model_trainer.load_metadata())


model_training_service = ModelTrainingService()
