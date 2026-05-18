from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.ml.evaluation import classify_score
from app.ml.explainability import explainability_service
from app.ml.feature_engineering import FinancialFeatureEngineer, FinancialFeatureSet
from app.ml.training import CreditModelTrainer


@dataclass(frozen=True)
class ScoreBreakdown:
    ml_prediction: float
    behavioral_score: float
    financial_health_score: float
    final_score: float
    risk_level: str
    model_version: str
    model_name: str
    explanations: list[dict[str, str]]
    feature_importance: list[dict[str, float | str]]


class CreditScoringEngine:
    def __init__(
        self,
        trainer: CreditModelTrainer | None = None,
        feature_engineer: FinancialFeatureEngineer | None = None,
    ):
        self.trainer = trainer or CreditModelTrainer()
        self.feature_engineer = feature_engineer or FinancialFeatureEngineer()

    def score(self, feature_set: FinancialFeatureSet) -> ScoreBreakdown:
        artifact = self.trainer.load_artifact()
        if self._has_no_financial_history(feature_set):
            ml_prediction = behavioral_score = financial_health_score = 300.0
        else:
            ml_prediction = self._predict_with_model(artifact, feature_set)
            behavioral_score = self._behavioral_score(feature_set)
            financial_health_score = self._financial_health_score(feature_set)
        final_score = round(
            self._clip_score(
                (0.55 * ml_prediction)
                + (0.25 * behavioral_score)
                + (0.20 * financial_health_score)
            ),
            2,
        )
        metadata = self.trainer.load_metadata()
        return ScoreBreakdown(
            ml_prediction=round(ml_prediction, 2),
            behavioral_score=round(behavioral_score, 2),
            financial_health_score=round(financial_health_score, 2),
            final_score=final_score,
            risk_level=classify_score(final_score),
            model_version=str(metadata.get("model_version") or "heuristic-baseline-v1"),
            model_name=str(metadata.get("model_name") or "Heuristic Baseline"),
            explanations=explainability_service.local_explanations(feature_set),
            feature_importance=explainability_service.feature_importance(
                artifact,
                feature_set,
            ),
        )

    def _predict_with_model(
        self,
        artifact: dict[str, Any] | None,
        feature_set: FinancialFeatureSet,
    ) -> float:
        if artifact is None or artifact.get("model") is None:
            return self._heuristic_ml_proxy(feature_set)
        dataframe = self.feature_engineer.feature_frame(feature_set)
        prediction = float(artifact["model"].predict(dataframe)[0])
        return self._clip_score(prediction)

    def _heuristic_ml_proxy(self, feature_set: FinancialFeatureSet) -> float:
        features = feature_set.features
        return self._clip_score(
            300
            + (155 * features["financial_discipline_score"])
            + (105 * features["income_stability_score"])
            + (95 * features["cash_flow_consistency"])
            + (85 * features["recurring_income_confidence"])
            + (60 * features["transaction_regularity_score"])
            + (45 * features["merchant_diversity_score"])
            + (40 * ((features["monthly_growth_trend"] + 1) / 2))
            - (80 * min(features["spending_to_income_ratio"], 1.6) / 1.6)
            - (70 * min(features["spending_volatility"], 2.0) / 2.0)
            - (70 * features["impulsive_spending_score"])
            - (55 * features["high_risk_spending_frequency"])
        )

    def _behavioral_score(self, feature_set: FinancialFeatureSet) -> float:
        features = feature_set.features
        return self._clip_score(
            300
            + (180 * features["financial_discipline_score"])
            + (115 * features["transaction_regularity_score"])
            + (100 * features["recurring_income_confidence"])
            + (65 * features["merchant_diversity_score"])
            - (95 * features["impulsive_spending_score"])
            - (85 * features["high_risk_spending_frequency"])
        )

    def _financial_health_score(self, feature_set: FinancialFeatureSet) -> float:
        features = feature_set.features
        normalized_savings = max(0.0, min(1.0, (features["savings_ratio"] + 0.25) / 0.75))
        spending_pressure = max(0.0, min(1.0, features["spending_to_income_ratio"]))
        volatility_pressure = max(0.0, min(1.0, features["spending_volatility"] / 1.5))
        return self._clip_score(
            300
            + (165 * normalized_savings)
            + (130 * features["income_stability_score"])
            + (125 * features["cash_flow_consistency"])
            + (75 * ((features["monthly_growth_trend"] + 1) / 2))
            - (90 * spending_pressure)
            - (75 * volatility_pressure)
        )

    def _clip_score(self, score: float) -> float:
        return float(max(300.0, min(900.0, score)))

    def _has_no_financial_history(self, feature_set: FinancialFeatureSet) -> bool:
        features = feature_set.features
        return (
            features["transaction_frequency"] <= 0
            and features["average_monthly_income"] <= 0
            and features["average_monthly_spending"] <= 0
        )


credit_scoring_engine = CreditScoringEngine()
