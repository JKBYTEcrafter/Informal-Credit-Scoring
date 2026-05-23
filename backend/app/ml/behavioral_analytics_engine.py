"""
Behavioral Analytics Engine - Sprint 3
Classifies spending profiles, detects anomalous patterns,
and surfaces contextual behavioral insights.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.ml.feature_engineering import FinancialFeatureSet


@dataclass(frozen=True)
class SpenderProfile:
    profile_label: str
    profile_description: str
    risk_flags: list[str]
    strengths: list[str]


@dataclass(frozen=True)
class BehavioralInsightEntry:
    insight_type: str
    insight_description: str
    severity: str  # "Critical" | "Warning" | "Info"


@dataclass(frozen=True)
class BehavioralAnalysisResult:
    spender_profile: SpenderProfile
    insights: list[BehavioralInsightEntry]
    spending_patterns: dict[str, Any]
    merchant_concentration: list[dict[str, Any]]
    category_risk_breakdown: list[dict[str, Any]]


class BehavioralAnalyticsEngine:
    """
    Classifies user spending behavior and extracts behavioral insights
    from the feature set and raw category distribution data.
    """

    def analyze(self, feature_set: FinancialFeatureSet) -> BehavioralAnalysisResult:
        f = feature_set.features
        spender_profile = self._classify_profile(f)
        insights = self._generate_insights(f, feature_set.categorical_features)
        spending_patterns = self._spending_patterns(f, feature_set.categorical_features)
        merchant_concentration = self._merchant_concentration(feature_set.category_distribution)
        category_risk_breakdown = self._category_risk_breakdown(feature_set.category_distribution)

        return BehavioralAnalysisResult(
            spender_profile=spender_profile,
            insights=insights,
            spending_patterns=spending_patterns,
            merchant_concentration=merchant_concentration,
            category_risk_breakdown=category_risk_breakdown,
        )

    def _classify_profile(self, f: dict) -> SpenderProfile:
        """
        Classify user into one of six behavioral archetypes based on
        multi-dimensional feature signal combinations.
        """
        is_disciplined = f["financial_discipline_score"] >= 0.60
        is_stable = f["income_stability_score"] >= 0.65
        is_volatile = f["spending_volatility"] > 0.55
        is_impulsive = f["impulsive_spending_score"] > 0.40
        is_high_risk = f["high_risk_spending_frequency"] > 0.12
        is_saver = f["savings_ratio"] >= 0.20
        is_deficit = f["savings_ratio"] < 0.0

        if is_disciplined and is_stable and is_saver:
            return SpenderProfile(
                profile_label="Disciplined Saver",
                profile_description=(
                    "You demonstrate exceptional financial discipline with consistent income, "
                    "strong savings habits, and controlled spending. You represent a low-risk "
                    "credit profile with high repayment confidence."
                ),
                risk_flags=[],
                strengths=[
                    "Strong savings discipline",
                    "Consistent income patterns",
                    "Low spending volatility",
                    "High financial discipline score",
                ],
            )

        if is_stable and not is_impulsive and not is_volatile:
            return SpenderProfile(
                profile_label="Stable Income Profile",
                profile_description=(
                    "Your income is reliable and your spending is controlled. "
                    "Minor improvements in savings rate would elevate your financial profile significantly."
                ),
                risk_flags=["Savings ratio slightly below optimal"],
                strengths=[
                    "Reliable recurring income",
                    "Controlled spending behavior",
                    "Good transaction regularity",
                ],
            )

        if is_volatile and is_impulsive and is_high_risk:
            return SpenderProfile(
                profile_label="High Volatility Spender",
                profile_description=(
                    "Your spending patterns show significant volatility with impulsive behavior "
                    "and high-risk category activity. This elevates your financial risk profile "
                    "and reduces credit confidence."
                ),
                risk_flags=[
                    "Elevated spending volatility",
                    "Impulsive spending detected",
                    "High-risk categories active",
                ],
                strengths=["Transaction activity is consistent"],
            )

        if is_impulsive and not is_volatile:
            return SpenderProfile(
                profile_label="Impulse-Prone Spender",
                profile_description=(
                    "You have moderate financial stability but show signs of impulsive spending "
                    "particularly around weekends and discretionary categories. "
                    "Targeted budgeting can significantly improve your profile."
                ),
                risk_flags=[
                    "Weekend spending elevated",
                    "Discretionary impulsive purchases detected",
                ],
                strengths=[
                    "Relatively stable income",
                    "Some savings discipline present",
                ],
            )

        if is_deficit:
            return SpenderProfile(
                profile_label="Cash Flow Deficit Profile",
                profile_description=(
                    "Your expenses consistently exceed your income, resulting in a cash flow deficit. "
                    "This is the most critical financial signal and requires immediate corrective action."
                ),
                risk_flags=[
                    "Negative savings ratio",
                    "Monthly spending exceeds income",
                    "High credit risk",
                ],
                strengths=["Transaction frequency is active"],
            )

        return SpenderProfile(
            profile_label="Balanced Spender",
            profile_description=(
                "Your financial profile shows a reasonable balance between income and expenses "
                "with moderate savings. Targeted improvements in consistency will improve your score."
            ),
            risk_flags=["Savings rate could be improved"],
            strengths=[
                "Balanced income-to-expense ratio",
                "Moderate financial discipline",
            ],
        )

    def _generate_insights(
        self, f: dict, cat: dict
    ) -> list[BehavioralInsightEntry]:
        insights: list[BehavioralInsightEntry] = []

        if f["impulsive_spending_score"] > 0.50:
            insights.append(BehavioralInsightEntry(
                insight_type="Impulse Spending",
                insight_description=(
                    f"Impulse spending score is {f['impulsive_spending_score']:.0%}. "
                    "Weekend and high-risk spending patterns suggest impulsive purchasing behavior."
                ),
                severity="Critical",
            ))

        if f["spending_volatility"] > 0.70:
            insights.append(BehavioralInsightEntry(
                insight_type="Spending Spike",
                insight_description=(
                    f"Your monthly spending varies by a coefficient of {f['spending_volatility']:.2f}, "
                    "indicating significant unexpected expense spikes."
                ),
                severity="Warning",
            ))

        if f["high_risk_spending_frequency"] > 0.10:
            insights.append(BehavioralInsightEntry(
                insight_type="High-Risk Category Activity",
                insight_description=(
                    f"{f['high_risk_spending_frequency']:.0%} of your transactions are in "
                    "high-risk categories (gambling, luxury, nightlife, late fees)."
                ),
                severity="Critical" if f["high_risk_spending_frequency"] > 0.20 else "Warning",
            ))

        if f["weekend_spending_ratio"] > 0.45:
            insights.append(BehavioralInsightEntry(
                insight_type="Weekend Spending Concentration",
                insight_description=(
                    f"{f['weekend_spending_ratio']:.0%} of your total expenses occur on weekends, "
                    "suggesting unplanned discretionary spending."
                ),
                severity="Warning",
            ))

        if f["income_stability_score"] < 0.40:
            insights.append(BehavioralInsightEntry(
                insight_type="Income Instability",
                insight_description=(
                    "Income patterns show high month-to-month variance. Irregular income "
                    "significantly reduces repayment confidence scoring."
                ),
                severity="Critical",
            ))

        if f["merchant_diversity_score"] < 0.20:
            insights.append(BehavioralInsightEntry(
                insight_type="Merchant Concentration",
                insight_description=(
                    "Spending is highly concentrated among very few merchants, "
                    "indicating limited financial activity diversity."
                ),
                severity="Warning",
            ))

        if f["recurring_income_confidence"] >= 0.75:
            insights.append(BehavioralInsightEntry(
                insight_type="Strong Recurring Income",
                insight_description=(
                    f"Recurring income confidence is {f['recurring_income_confidence']:.0%}. "
                    "Stable, repeatable income patterns strongly support creditworthiness."
                ),
                severity="Info",
            ))

        if f["financial_discipline_score"] >= 0.65:
            insights.append(BehavioralInsightEntry(
                insight_type="High Financial Discipline",
                insight_description=(
                    f"Financial discipline score of {f['financial_discipline_score']:.0%} "
                    "indicates excellent spending control and savings behavior."
                ),
                severity="Info",
            ))

        if f["cash_flow_consistency"] >= 0.75:
            insights.append(BehavioralInsightEntry(
                insight_type="Consistent Cash Flow",
                insight_description=(
                    "Monthly net cash flow is highly consistent, which is a strong predictor "
                    "of reliable repayment capacity."
                ),
                severity="Info",
            ))

        return insights[:8]

    def _spending_patterns(self, f: dict, cat: dict) -> dict:
        return {
            "cash_flow_pattern": cat.get("cash_flow_pattern", "unknown"),
            "dominant_category": cat.get("dominant_category", "none"),
            "savings_ratio_pct": round(f["savings_ratio"] * 100, 1),
            "spending_to_income_pct": round(f["spending_to_income_ratio"] * 100, 1),
            "weekend_spending_pct": round(f["weekend_spending_ratio"] * 100, 1),
            "high_risk_pct": round(f["high_risk_spending_frequency"] * 100, 1),
            "transaction_frequency_monthly": round(f["transaction_frequency"], 1),
            "monthly_growth_trend_pct": round(f["monthly_growth_trend"] * 100, 1),
        }

    def _merchant_concentration(self, category_distribution: list) -> list[dict]:
        if not category_distribution:
            return []
        total = sum(item.get("total_spent", 0) for item in category_distribution) or 1.0
        return [
            {
                "category": item["category"],
                "total_spent": item["total_spent"],
                "share_pct": round(item.get("ratio", 0) * 100, 1),
                "risk_flag": item["category"].lower()
                in {"gambling", "betting", "casino", "alcohol", "luxury", "nightlife", "late_fee"},
            }
            for item in category_distribution[:8]
        ]

    def _category_risk_breakdown(self, category_distribution: list) -> list[dict]:
        HIGH_RISK = {"gambling", "betting", "casino", "alcohol", "tobacco", "nightlife", "luxury", "cash_advance", "late_fee"}
        MEDIUM_RISK = {"entertainment", "gaming", "travel", "clothing"}
        result = []
        for item in category_distribution:
            cat = item["category"].lower()
            if cat in HIGH_RISK:
                risk = "High"
            elif cat in MEDIUM_RISK:
                risk = "Medium"
            else:
                risk = "Low"
            result.append({
                "category": item["category"],
                "risk_level": risk,
                "total_spent": item["total_spent"],
                "ratio": item.get("ratio", 0),
            })
        return result


behavioral_analytics_engine = BehavioralAnalyticsEngine()
