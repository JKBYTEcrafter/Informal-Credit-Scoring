"""
Recommendation Engine - Sprint 3
Generates prioritized, actionable, personalized financial recommendations
based on the user's computed feature set and score breakdown.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.ml.feature_engineering import FinancialFeatureSet


@dataclass(frozen=True)
class RecommendationEntry:
    recommendation: str
    priority: str  # "High" | "Medium" | "Low"
    category: str


class RecommendationEngine:
    """
    Rule-based personalized recommendation engine.
    Produces ordered list from highest to lowest priority.
    """

    def generate(self, feature_set: FinancialFeatureSet, credit_score: float) -> list[RecommendationEntry]:
        f = feature_set.features
        cat = feature_set.categorical_features
        recommendations: list[RecommendationEntry] = []

        # ------------------------------------------------------------------ #
        # HIGH PRIORITY RULES (critical risk signals)
        # ------------------------------------------------------------------ #
        if f["savings_ratio"] < 0.05:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your savings rate is critically low. Aim to save at least 10% of monthly income "
                    "by reducing discretionary expenses and setting up automatic transfers."
                ),
                priority="High",
                category="savings",
            ))

        if f["high_risk_spending_frequency"] > 0.15:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "High-risk spending categories (gambling, luxury, nightlife) account for over 15% "
                    "of your transactions. Reducing this significantly improves your credit profile."
                ),
                priority="High",
                category="risk_spending",
            ))

        if f["spending_to_income_ratio"] > 1.0:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your monthly spending exceeds your income. Immediately identify and cut "
                    "non-essential expenses to avoid debt accumulation."
                ),
                priority="High",
                category="budgeting",
            ))

        if f["income_stability_score"] < 0.35:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your income is highly irregular. Establishing predictable income streams "
                    "(regular salary or contracts) will substantially improve your credit score."
                ),
                priority="High",
                category="income",
            ))

        if cat.get("cash_flow_pattern") == "deficit":
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your monthly cash flow is in deficit. Prioritize reducing fixed obligations "
                    "and avoid new credit commitments until balance is restored."
                ),
                priority="High",
                category="cash_flow",
            ))

        # ------------------------------------------------------------------ #
        # MEDIUM PRIORITY RULES (moderate improvement opportunities)
        # ------------------------------------------------------------------ #
        if 0.05 <= f["savings_ratio"] < 0.15:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your savings ratio is below optimal. Targeting 20-25% savings will move you "
                    "into the Low Risk credit band and improve long-term financial resilience."
                ),
                priority="Medium",
                category="savings",
            ))

        if f["spending_volatility"] > 0.6:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your spending varies significantly month to month. Creating a fixed monthly budget "
                    "and tracking expenses will reduce volatility and improve your score."
                ),
                priority="Medium",
                category="budgeting",
            ))

        if f["merchant_diversity_score"] < 0.25:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your spending is concentrated in very few merchants. Diversifying your purchases "
                    "signals broader, healthier financial activity to credit models."
                ),
                priority="Medium",
                category="spending_patterns",
            ))

        if f["weekend_spending_ratio"] > 0.40:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Over 40% of your spending occurs on weekends. Planning weekend activities "
                    "with a fixed discretionary budget can help reduce impulsive spending."
                ),
                priority="Medium",
                category="behavioral",
            ))

        if f["impulsive_spending_score"] > 0.35:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Behavioral patterns indicate impulsive spending. Applying a 24-hour waiting "
                    "rule for non-essential purchases over a set threshold can help."
                ),
                priority="Medium",
                category="behavioral",
            ))

        if f["transaction_regularity_score"] < 0.45:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Irregular transaction patterns reduce scoring confidence. Consistent monthly "
                    "financial activity (bills, subscriptions) strengthens your credit profile."
                ),
                priority="Medium",
                category="transaction_patterns",
            ))

        # ------------------------------------------------------------------ #
        # LOW PRIORITY RULES (optimization and fine-tuning)
        # ------------------------------------------------------------------ #
        if f["recurring_income_confidence"] < 0.60:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Recurring income isn't highly detected. Regular salary deposits or retainer "
                    "payments from the same source significantly boost your credit confidence score."
                ),
                priority="Low",
                category="income",
            ))

        if f["monthly_growth_trend"] < -0.10:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your net cash flow shows a declining trend over recent months. Review "
                    "fixed obligations and consider income augmentation strategies."
                ),
                priority="Low",
                category="cash_flow",
            ))

        if f["cash_flow_consistency"] < 0.55:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Inconsistent cash flow reduces your financial stability score. "
                    "Maintaining predictable monthly income and expenses is key."
                ),
                priority="Low",
                category="cash_flow",
            ))

        if credit_score >= 750:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "Your credit score is in the Low Risk range. Maintain current financial "
                    "discipline and consider exploring premium credit products."
                ),
                priority="Low",
                category="credit_strategy",
            ))
        elif credit_score >= 600:
            recommendations.append(RecommendationEntry(
                recommendation=(
                    "You're in the Medium Risk band. Focusing on savings consistency and "
                    "reducing discretionary spending can elevate you to Low Risk within 3 months."
                ),
                priority="Low",
                category="credit_strategy",
            ))

        # Deduplicate and limit
        seen: set[str] = set()
        unique: list[RecommendationEntry] = []
        for rec in recommendations:
            if rec.recommendation not in seen:
                seen.add(rec.recommendation)
                unique.append(rec)

        # Sort: High → Medium → Low, then limit to 8
        priority_order = {"High": 0, "Medium": 1, "Low": 2}
        return sorted(unique, key=lambda r: priority_order[r.priority])[:8]


recommendation_engine = RecommendationEngine()
