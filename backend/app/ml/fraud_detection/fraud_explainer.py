from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from app.ml.fraud_detection.fraud_feature_engineer import FraudFeatureSet
from app.ml.fraud_detection.fraud_scorer import FraudScoringResult


@dataclass
class FraudFeatureContributionData:
    """Computed explainability data for one feature."""

    feature: str
    readable_label: str
    contribution: float
    feature_value: float
    impact: str  # "high_risk" | "medium_risk" | "low_risk"
    explanation: str


# Mapping: feature_key → (readable_label, explanation_template)
# Template placeholders: {value} = raw feature value (0-1), {pct} = percentage
_FEATURE_META: dict[str, tuple[str, str]] = {
    "transaction_velocity": (
        "Transaction Velocity",
        "Transaction velocity of {value:.2f} per day (normalised) indicates {speed} frequency of activity.",
    ),
    "spending_spike_ratio": (
        "Spending Spike",
        "Spending spike ratio of {pct:.0f}% above baseline suggests {level} unusual one-day expenditure.",
    ),
    "merchant_concentration_score": (
        "Merchant Concentration",
        "Top merchant accounts for {pct:.0f}% of all transactions — {level} concentration.",
    ),
    "nighttime_transaction_ratio": (
        "Night-time Activity",
        "{pct:.0f}% of transactions occur between 22:00 and 06:00 — {level} night-time activity.",
    ),
    "unusual_category_score": (
        "Category Diversity",
        "Category diversity score of {value:.2f} reflects {level} spread across spending types.",
    ),
    "high_freq_withdrawal_score": (
        "Withdrawal Frequency",
        "{pct:.0f}% of transactions are debits, indicating {level} withdrawal intensity.",
    ),
    "transaction_entropy": (
        "Merchant Entropy",
        "Merchant entropy of {value:.2f} reflects {level} randomness in merchant selection.",
    ),
    "weekend_anomaly_score": (
        "Weekend Spending",
        "{pct:.0f}% of total spending occurs on weekends — {level} weekend concentration.",
    ),
    "amount_zscore_max": (
        "Transaction Amount Outlier",
        "Maximum z-score of transaction amounts is {value:.2f} (normalised) — {level} outlier presence.",
    ),
    "velocity_acceleration": (
        "Velocity Acceleration",
        "Transaction frequency is accelerating (score {value:.2f}) — indicates {level} escalation.",
    ),
    "merchant_novelty_score": (
        "Merchant Novelty",
        "{pct:.0f}% of merchants appear only once — {level} novelty in transaction counterparties.",
    ),
    "category_drift_score": (
        "Category Drift",
        "Category drift score of {value:.2f} indicates {level} shift in spending categories over time.",
    ),
    "round_number_ratio": (
        "Round Number Pattern",
        "{pct:.0f}% of transactions have round amounts (×100 or ×1000) — {level} structured pattern.",
    ),
    "rapid_balance_depletion": (
        "Rapid Balance Depletion",
        "Rapid depletion score of {value:.2f} — a single debit represents {level} share of monthly income.",
    ),
    "behavioral_fingerprint_deviation": (
        "Behavioral Deviation",
        "Behavioral fingerprint deviation of {value:.2f} indicates {level} departure from normal patterns.",
    ),
}

_LEVEL_LABELS = {
    "high_risk": ["extremely high", "very high", "critically elevated", "dangerously high"],
    "medium_risk": ["moderately elevated", "above-average", "somewhat elevated"],
    "low_risk": ["normal", "acceptable", "within expected range"],
}


def _level_word(impact: str, idx: int = 0) -> str:
    labels = _LEVEL_LABELS.get(impact, ["normal"])
    return labels[idx % len(labels)]


class FraudExplainabilityEngine:
    """
    Generates per-feature explainability data for fraud scoring results.
    Uses template-based explanations derived from feature values.
    """

    def explain(
        self,
        feature_set: FraudFeatureSet,
        fraud_score_result: FraudScoringResult,
    ) -> list[FraudFeatureContributionData]:
        """
        Compute feature contributions and explanations.
        Returns top 8 features sorted by |contribution| descending.
        """
        base_prob = 0.10  # Average base fraud probability in the population
        contributions: list[FraudFeatureContributionData] = []

        for feature, (readable_label, template) in _FEATURE_META.items():
            value = feature_set.features.get(feature, 0.0)
            # Contribution: how much this feature shifts probability from base
            # Simple linear weighting relative to total fraud probability
            contribution = (value - 0.5) * (fraud_score_result.fraud_probability - base_prob) * 0.15

            if value >= 0.6:
                impact = "high_risk"
            elif value >= 0.3:
                impact = "medium_risk"
            else:
                impact = "low_risk"

            level = _level_word(impact)
            speed = level  # reuse for velocity template
            pct = value * 100.0

            try:
                explanation = template.format(value=value, pct=pct, level=level, speed=speed)
            except KeyError:
                explanation = f"{readable_label} score is {value:.2f}."

            contributions.append(
                FraudFeatureContributionData(
                    feature=feature,
                    readable_label=readable_label,
                    contribution=round(contribution, 4),
                    feature_value=round(value, 4),
                    impact=impact,
                    explanation=explanation,
                )
            )

        # Sort by absolute contribution, return top 8
        contributions.sort(key=lambda c: abs(c.contribution), reverse=True)
        return contributions[:8]

    def generate_anomaly_reasoning(
        self,
        feature_set: FraudFeatureSet,
        fraud_score_result: FraudScoringResult,
        contributions: list[FraudFeatureContributionData],
    ) -> list[str]:
        """
        Generate 3-5 plain-English reasoning sentences for the fraud score.
        """
        sentences: list[str] = []

        prob = fraud_score_result.fraud_probability
        rl = fraud_score_result.risk_level
        sentences.append(
            f"The overall fraud probability is {prob:.1%}, classifying this account as '{rl}'."
        )

        high_risk_features = [c for c in contributions if c.impact == "high_risk"]
        if high_risk_features:
            names = ", ".join(c.readable_label for c in high_risk_features[:3])
            sentences.append(
                f"The primary risk signals are: {names}."
            )

        velocity = feature_set.features.get("transaction_velocity", 0.0)
        if velocity > 0.15:
            sentences.append(
                "Transaction velocity is significantly above the normal range, "
                "suggesting potential automated or fraudulent activity."
            )

        nighttime = feature_set.features.get("nighttime_transaction_ratio", 0.0)
        if nighttime > 0.25:
            sentences.append(
                f"{nighttime * 100:.0f}% of transactions occur late at night, "
                "which is a known indicator of account compromise."
            )

        depletion = feature_set.features.get("rapid_balance_depletion", 0.0)
        if depletion > 0.4:
            sentences.append(
                "A single withdrawal exceeds 40% of average monthly income, "
                "consistent with rapid balance depletion patterns seen in fraud cases."
            )

        if len(sentences) < 3:
            sentences.append(
                f"Analysis is based on {feature_set.transaction_count} transactions "
                f"spanning {feature_set.date_range_days} days."
            )

        return sentences[:5]


fraud_explainability_engine = FraudExplainabilityEngine()
