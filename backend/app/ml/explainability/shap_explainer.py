from __future__ import annotations

from typing import Any

import numpy as np

from app.ml.feature_engineering import FinancialFeatureSet

RULE_IMPORTANCE_WEIGHTS = {
    "financial_discipline_score": 0.18,
    "savings_ratio": 0.14,
    "income_stability_score": 0.13,
    "cash_flow_consistency": 0.12,
    "recurring_income_confidence": 0.11,
    "spending_to_income_ratio": 0.10,
    "spending_volatility": 0.09,
    "impulsive_spending_score": 0.08,
    "high_risk_spending_frequency": 0.05,
}


class ExplainabilityService:
    def local_explanations(self, feature_set: FinancialFeatureSet) -> list[dict[str, str]]:
        features = feature_set.features
        explanations: list[dict[str, str]] = []

        if features["savings_ratio"] >= 0.25:
            explanations.append(
                {
                    "feature": "savings_ratio",
                    "impact": "positive",
                    "message": "Savings ratio improved your score.",
                }
            )
        elif features["savings_ratio"] < 0.05:
            explanations.append(
                {
                    "feature": "savings_ratio",
                    "impact": "negative",
                    "message": "Low savings discipline reduced your score.",
                }
            )

        if features["spending_volatility"] > 0.45:
            explanations.append(
                {
                    "feature": "spending_volatility",
                    "impact": "negative",
                    "message": "Credit score reduced because spending volatility is elevated.",
                }
            )

        if features["recurring_income_confidence"] >= 0.70:
            explanations.append(
                {
                    "feature": "recurring_income_confidence",
                    "impact": "positive",
                    "message": "Stable recurring income positively affected your rating.",
                }
            )
        elif features["income_stability_score"] < 0.45:
            explanations.append(
                {
                    "feature": "income_stability_score",
                    "impact": "negative",
                    "message": "Income inconsistency reduced confidence in repayment capacity.",
                }
            )

        if features["high_risk_spending_frequency"] > 0.12:
            explanations.append(
                {
                    "feature": "high_risk_spending_frequency",
                    "impact": "negative",
                    "message": "Frequent high-risk spending lowered your score.",
                }
            )

        if features["cash_flow_consistency"] >= 0.70:
            explanations.append(
                {
                    "feature": "cash_flow_consistency",
                    "impact": "positive",
                    "message": "Consistent monthly cash flow improved your financial health rating.",
                }
            )

        if not explanations:
            explanations.append(
                {
                    "feature": "transaction_history",
                    "impact": "neutral",
                    "message": "More transaction history will improve scoring confidence.",
                }
            )
        return explanations[:6]

    def feature_importance(
        self,
        artifact: dict[str, Any] | None,
        feature_set: FinancialFeatureSet,
    ) -> list[dict[str, float | str]]:
        shap_values = self._shap_importance(artifact, feature_set)
        if shap_values:
            return shap_values

        model_values = self._model_importance(artifact)
        if model_values:
            return model_values

        return [
            {
                "feature": feature,
                "importance": round(weight, 4),
                "method": "rules",
            }
            for feature, weight in sorted(
                RULE_IMPORTANCE_WEIGHTS.items(),
                key=lambda item: item[1],
                reverse=True,
            )
        ]

    def _model_importance(self, artifact: dict[str, Any] | None) -> list[dict[str, float | str]]:
        if artifact is None:
            return []
        pipeline = artifact.get("model")
        if pipeline is None:
            return []
        model = pipeline.named_steps.get("model")
        importances = getattr(model, "feature_importances_", None)
        if importances is None:
            return []

        names = self._feature_names(pipeline, importances)
        pairs = sorted(
            zip(names, importances, strict=False),
            key=lambda item: float(item[1]),
            reverse=True,
        )[:10]
        return [
            {
                "feature": self._readable_feature_name(name),
                "importance": round(float(value), 4),
                "method": "model_importance",
            }
            for name, value in pairs
        ]

    def _shap_importance(
        self,
        artifact: dict[str, Any] | None,
        feature_set: FinancialFeatureSet,
    ) -> list[dict[str, float | str]]:
        if artifact is None:
            return []
        try:
            import shap
        except ImportError:
            return []

        pipeline = artifact.get("model")
        if pipeline is None:
            return []
        try:
            preprocessor = pipeline.named_steps["preprocessor"]
            model = pipeline.named_steps["model"]
            dataframe = self._feature_frame_from_artifact(artifact, feature_set)
            transformed = preprocessor.transform(dataframe)
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(transformed)
            values = np.abs(np.asarray(shap_values)).reshape(-1)
            names = self._feature_names(pipeline, values)
        except Exception:
            return []

        pairs = sorted(
            zip(names, values, strict=False),
            key=lambda item: float(item[1]),
            reverse=True,
        )[:10]
        total = float(sum(value for _, value in pairs)) or 1.0
        return [
            {
                "feature": self._readable_feature_name(name),
                "importance": round(float(value) / total, 4),
                "method": "shap",
            }
            for name, value in pairs
        ]

    def _feature_names(self, pipeline, importances) -> list[str]:  # noqa: ANN001
        try:
            names = list(pipeline.named_steps["preprocessor"].get_feature_names_out())
        except Exception:
            names = []
        if len(names) != len(importances):
            return [f"feature_{index}" for index in range(len(importances))]
        return names

    def _readable_feature_name(self, name: str) -> str:
        return (
            name.replace("numeric__", "")
            .replace("categorical__", "")
            .replace("dominant_category_", "dominant category: ")
            .replace("cash_flow_pattern_", "cash flow: ")
            .replace("_", " ")
        )

    def _feature_frame_from_artifact(
        self,
        artifact: dict[str, Any],
        feature_set: FinancialFeatureSet,
    ):
        schema = artifact.get("feature_schema", {})
        row = {
            feature: feature_set.features.get(feature, 0.0)
            for feature in schema.get("numeric", [])
        }
        row.update(
            {
                feature: feature_set.categorical_features.get(feature, "unknown")
                for feature in schema.get("categorical", [])
            }
        )
        import pandas as pd

        return pd.DataFrame([row])


explainability_service = ExplainabilityService()
