from typing import Any, Dict
from app.ml.fraud_detection.fraud_trainer import fraud_model_trainer
from app.schemas.sprint4 import FraudModelMetricsResponse
from app.config.settings import get_settings

class FraudTrainingService:
    def retrain_fraud_model(self) -> Dict[str, Any]:
        metrics = fraud_model_trainer.train()
        return metrics

    def get_fraud_model_metrics(self) -> FraudModelMetricsResponse:
        metrics_dict = fraud_model_trainer.get_metrics()
        return FraudModelMetricsResponse(**metrics_dict)

fraud_training_service = FraudTrainingService()
