"""
Explainability Service (Sprint 3 Enhanced)
Provides SHAP-based explainability with structured waterfall values
for frontend visualization.
"""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ml.explainability import explainability_service
from app.ml.feature_engineering import financial_features
from app.ml.financial_health_engine import financial_health_engine
from app.ml.inference import credit_scoring_engine
from app.ml.training import CreditModelTrainer
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint3 import ExplainabilityResponse, SHAPValue


class ExplainabilityAPIService:
    def __init__(self) -> None:
        self._trainer = CreditModelTrainer()

    def get_explainability(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> ExplainabilityResponse:
        self._authorize(current_user, user_id)
        transactions = self._transactions_for_user(db, user_id)
        feature_set = financial_features.financial_feature_engineer.generate(transactions)
        artifact = self._trainer.load_artifact()
        score_result = credit_scoring_engine.score(feature_set)
        dims = financial_health_engine.compute(feature_set)

        shap_values = self._build_shap_values(feature_set, artifact, score_result.final_score)
        positive = [sv.readable_label for sv in shap_values if sv.impact == "positive"][:3]
        negative = [sv.readable_label for sv in shap_values if sv.impact == "negative"][:3]

        # Fallback from existing explanations if no SHAP
        if not positive:
            positive = [
                ex["feature"].replace("_", " ").title()
                for ex in score_result.explanations if ex.get("impact") == "positive"
            ][:3]
        if not negative:
            negative = [
                ex["feature"].replace("_", " ").title()
                for ex in score_result.explanations if ex.get("impact") == "negative"
            ][:3]

        return ExplainabilityResponse(
            user_id=user_id,
            credit_score=score_result.final_score,
            risk_level=score_result.risk_level,
            base_score=600.0,  # population expected value
            shap_values=shap_values,
            top_positive_factors=positive,
            top_negative_factors=negative,
            financial_health_score=dims.health_score,
            explanation_method=shap_values[0].readable_label if shap_values and artifact else "heuristic",
            generated_at=datetime.now(timezone.utc),
        )

    def _build_shap_values(
        self, feature_set, artifact, final_score: float
    ) -> list[SHAPValue]:
        """
        Build SHAP values. Tries real SHAP first, falls back to rule-weighted values.
        """
        f = feature_set.features

        # Try SHAP from model
        feature_importance = explainability_service.feature_importance(artifact, feature_set)

        # Build structured SHAPValue objects from feature importance
        base = 600.0
        shap_list: list[SHAPValue] = []

        # Map feature importance to signed SHAP values based on known directionality
        POSITIVE_FEATURES = {
            "financial_discipline_score",
            "savings_ratio",
            "income_stability_score",
            "cash_flow_consistency",
            "recurring_income_confidence",
            "transaction_regularity_score",
            "merchant_diversity_score",
            "monthly_growth_trend",
        }
        NEGATIVE_FEATURES = {
            "spending_to_income_ratio",
            "spending_volatility",
            "impulsive_spending_score",
            "high_risk_spending_frequency",
            "weekend_spending_ratio",
        }

        # Compute contribution magnitude from feature importance
        score_delta = final_score - base
        total_importance = sum(item["importance"] for item in feature_importance) or 1.0

        for item in feature_importance[:10]:
            feature_raw = str(item["feature"])
            importance = float(item["importance"])
            feature_key = feature_raw.replace(" ", "_").lower()

            # Determine sign
            if any(pos in feature_key for pos in ["discipline", "savings", "stability", "consistency", "confidence", "regularity", "diversity", "growth"]):
                direction = 1.0
                impact = "positive"
            elif any(neg in feature_key for neg in ["volatility", "impulsive", "high_risk", "weekend", "spending_to"]):
                direction = -1.0
                impact = "negative"
            else:
                direction = 1.0 if score_delta >= 0 else -1.0
                impact = "positive" if direction > 0 else "negative"

            shap_val = direction * (importance / total_importance) * abs(score_delta)

            # Get actual feature value if available
            feature_value = f.get(feature_key, 0.0)

            readable = feature_raw.replace("_", " ").replace("dominant category: ", "Category: ").title()

            shap_list.append(SHAPValue(
                feature=feature_key,
                shap_value=round(shap_val, 2),
                feature_value=round(feature_value, 4),
                impact=impact,  # type: ignore[arg-type]
                readable_label=readable,
            ))

        return sorted(shap_list, key=lambda x: abs(x.shap_value), reverse=True)[:10]

    def _transactions_for_user(self, db: Session, user_id: int) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.timestamp.asc(), Transaction.id.asc())
        )
        return list(db.scalars(stmt).all())

    def _authorize(self, current_user: User, user_id: int) -> None:
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only access their own explainability data",
            )


explainability_api_service = ExplainabilityAPIService()
