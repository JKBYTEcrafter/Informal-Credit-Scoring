"""
Financial Health Engine - Sprint 3
Computes six-dimensional financial health scores from feature sets,
with percentile benchmarking against synthetic reference population.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.ml.feature_engineering import FinancialFeatureSet


@dataclass(frozen=True)
class FinancialHealthDimensions:
    health_score: int
    stability_score: int
    volatility_score: int
    cash_flow_health: int
    savings_discipline_score: int
    expense_management_score: int
    income_reliability_score: int
    percentile_benchmarks: dict[str, float]


# Population reference percentiles (derived from synthetic training data stats)
# These represent approximate thresholds for the 25th, 50th, and 75th percentile
# of the synthetic user population used to train the Sprint 2 model.
_POPULATION_REFERENCE = {
    "savings_ratio": {"p25": 0.07, "p50": 0.20, "p75": 0.35},
    "income_stability_score": {"p25": 0.55, "p50": 0.72, "p75": 0.85},
    "spending_volatility": {"p25": 0.25, "p50": 0.40, "p75": 0.65},
    "cash_flow_consistency": {"p25": 0.52, "p50": 0.68, "p75": 0.82},
    "financial_discipline_score": {"p25": 0.35, "p50": 0.52, "p75": 0.68},
    "transaction_regularity_score": {"p25": 0.45, "p50": 0.62, "p75": 0.78},
}


def _scale(value: float, low: float = 0.0, high: float = 1.0) -> int:
    """Linearly scale value in [low, high] to 0-100 integer score."""
    if high <= low:
        return 50
    clamped = max(low, min(high, value))
    return int(round(((clamped - low) / (high - low)) * 100))


def _percentile_rank(value: float, reference: dict) -> float:
    """
    Estimate user's approximate percentile (0-100) within population
    using the p25/p50/p75 reference anchors.
    """
    p25, p50, p75 = reference["p25"], reference["p50"], reference["p75"]
    if value <= p25:
        return max(0.0, 25.0 * (value / p25) if p25 > 0 else 0.0)
    if value <= p50:
        return 25.0 + 25.0 * ((value - p25) / (p50 - p25))
    if value <= p75:
        return 50.0 + 25.0 * ((value - p50) / (p75 - p50))
    return min(100.0, 75.0 + 25.0 * ((value - p75) / max(p75 * 0.5, 0.01)))


class FinancialHealthEngine:
    """
    Computes six-dimensional financial health from FinancialFeatureSet.
    All sub-scores are 0–100 integers; higher is better.
    """

    def compute(self, feature_set: FinancialFeatureSet) -> FinancialHealthDimensions:
        f = feature_set.features

        # 1. Income Reliability Score (0-100)
        income_reliability_score = _scale(
            (0.50 * f["income_stability_score"])
            + (0.35 * f["recurring_income_confidence"])
            + (0.15 * f["transaction_regularity_score"])
        )

        # 2. Savings Discipline Score (0-100)
        # savings_ratio in [-0.5, 0.75]; positive is good
        normalized_savings = max(0.0, min(1.0, (f["savings_ratio"] + 0.25) / 0.75))
        savings_discipline_score = _scale(
            (0.60 * normalized_savings)
            + (0.25 * f["cash_flow_consistency"])
            + (0.15 * f["financial_discipline_score"])
        )

        # 3. Expense Management Score (0-100); lower spending-to-income is better
        spending_pressure = max(0.0, min(1.0, f["spending_to_income_ratio"]))
        expense_management_score = _scale(
            (0.50 * (1.0 - spending_pressure))
            + (0.30 * (1.0 - f["impulsive_spending_score"]))
            + (0.20 * (1.0 - f["high_risk_spending_frequency"]))
        )

        # 4. Cash Flow Health (0-100)
        growth_normalized = (f["monthly_growth_trend"] + 1.0) / 2.0
        cash_flow_health = _scale(
            (0.45 * f["cash_flow_consistency"])
            + (0.30 * growth_normalized)
            + (0.25 * normalized_savings)
        )

        # 5. Stability Score (0-100)
        stability_score = _scale(
            (0.40 * f["income_stability_score"])
            + (0.30 * f["transaction_regularity_score"])
            + (0.30 * f["cash_flow_consistency"])
        )

        # 6. Volatility Score (0-100); LOWER spending volatility → HIGHER score
        volatility_raw = max(0.0, min(2.0, f["spending_volatility"]))
        volatility_score = _scale(1.0 - (volatility_raw / 2.0))

        # Aggregate health score
        health_score = _scale(
            (income_reliability_score / 100.0) * 0.20
            + (savings_discipline_score / 100.0) * 0.20
            + (expense_management_score / 100.0) * 0.20
            + (cash_flow_health / 100.0) * 0.15
            + (stability_score / 100.0) * 0.15
            + (volatility_score / 100.0) * 0.10
        )

        # Percentile benchmarks
        percentile_benchmarks = {
            "savings_ratio": round(
                _percentile_rank(f["savings_ratio"], _POPULATION_REFERENCE["savings_ratio"]), 1
            ),
            "income_stability": round(
                _percentile_rank(
                    f["income_stability_score"], _POPULATION_REFERENCE["income_stability_score"]
                ),
                1,
            ),
            "spending_discipline": round(
                _percentile_rank(
                    1.0 - f["spending_to_income_ratio"],
                    {"p25": 0.10, "p50": 0.30, "p75": 0.55},
                ),
                1,
            ),
            "cash_flow_consistency": round(
                _percentile_rank(
                    f["cash_flow_consistency"],
                    _POPULATION_REFERENCE["cash_flow_consistency"],
                ),
                1,
            ),
            "overall_health": round(
                _percentile_rank(
                    health_score / 100.0,
                    {"p25": 0.35, "p50": 0.52, "p75": 0.68},
                ),
                1,
            ),
        }

        return FinancialHealthDimensions(
            health_score=health_score,
            stability_score=stability_score,
            volatility_score=volatility_score,
            cash_flow_health=cash_flow_health,
            savings_discipline_score=savings_discipline_score,
            expense_management_score=expense_management_score,
            income_reliability_score=income_reliability_score,
            percentile_benchmarks=percentile_benchmarks,
        )


financial_health_engine = FinancialHealthEngine()
