from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np

from app.ml.fraud_detection.anomaly_detector import AnomalyDetectionResult
from app.ml.fraud_detection.fraud_feature_engineer import FraudFeatureSet


@dataclass
class FraudScoringResult:
    """Output of the fraud scoring pipeline."""

    fraud_probability: float  # 0.0-1.0
    risk_level: str  # Low Risk / Medium Risk / High Risk / Critical Risk
    confidence_score: float  # 0.0-1.0
    top_risk_factors: list[str]  # Human-readable factor names
    rule_score: float  # Component from rule engine
    anomaly_score: float  # Component from anomaly detector ensemble


# Thresholds
_MEDIUM = 0.35
_HIGH = 0.60
_CRITICAL = 0.80

# Rule definitions: (feature_key, threshold, weight, label)
_RULES: list[tuple[str, float, float, str]] = [
    ("transaction_velocity", 0.15, 0.20, "High transaction velocity"),
    ("spending_spike_ratio", 0.45, 0.18, "Abnormal spending spike"),
    ("merchant_concentration_score", 0.70, 0.12, "Extreme merchant concentration"),
    ("nighttime_transaction_ratio", 0.30, 0.15, "Excessive night-time activity"),
    ("rapid_balance_depletion", 0.40, 0.18, "Rapid balance depletion"),
    ("amount_zscore_max", 0.60, 0.15, "Unusually large single transaction"),
    ("behavioral_fingerprint_deviation", 0.50, 0.12, "Behavioral pattern deviation"),
    ("round_number_ratio", 0.60, 0.08, "High round-number transaction ratio"),
    ("velocity_acceleration", 0.70, 0.10, "Accelerating transaction frequency"),
    ("merchant_novelty_score", 0.70, 0.08, "Many one-off merchant relationships"),
]


class FraudScoringEngine:
    """
    Combines anomaly detection score with rule-based heuristic scoring
    to compute a final fraud probability and risk classification.
    """

    def score(
        self,
        feature_set: FraudFeatureSet,
        anomaly_result: AnomalyDetectionResult,
    ) -> FraudScoringResult:
        rule_score, triggered_rules = self._compute_rule_score(feature_set)

        # Weighted combination: anomaly model contributes 60%, rules 40%
        raw_probability = 0.6 * anomaly_result.ensemble_score + 0.4 * rule_score
        fraud_probability = float(np.clip(raw_probability, 0.0, 1.0))

        risk_level = self._classify_risk(fraud_probability)
        confidence = self._compute_confidence(feature_set)
        top_risk_factors = [label for _, label in triggered_rules[:5]]

        return FraudScoringResult(
            fraud_probability=round(fraud_probability, 4),
            risk_level=risk_level,
            confidence_score=round(confidence, 4),
            top_risk_factors=top_risk_factors,
            rule_score=round(rule_score, 4),
            anomaly_score=round(anomaly_result.ensemble_score, 4),
        )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _compute_rule_score(
        self, feature_set: FraudFeatureSet
    ) -> tuple[float, list[tuple[float, str]]]:
        """
        Evaluate rule set against features.
        Returns total weighted score (0-1) and list of (contribution, label) for triggered rules.
        """
        total_weight = sum(w for _, _, w, _ in _RULES)
        triggered: list[tuple[float, str]] = []
        weighted_sum = 0.0

        for feature_key, threshold, weight, label in _RULES:
            value = feature_set.features.get(feature_key, 0.0)
            if value > threshold:
                # Proportional contribution above threshold
                excess = (value - threshold) / max(1.0 - threshold, 0.01)
                contribution = weight * min(excess, 1.0)
                weighted_sum += contribution
                triggered.append((contribution, label))

        # Sort by contribution descending
        triggered.sort(key=lambda x: x[0], reverse=True)
        rule_score = float(np.clip(weighted_sum / total_weight, 0.0, 1.0))
        return rule_score, triggered

    def _classify_risk(self, probability: float) -> str:
        if probability >= _CRITICAL:
            return "Critical Risk"
        if probability >= _HIGH:
            return "High Risk"
        if probability >= _MEDIUM:
            return "Medium Risk"
        return "Low Risk"

    def _compute_confidence(self, feature_set: FraudFeatureSet) -> float:
        """
        Confidence increases with more data points.
        Full confidence at 100+ transactions over 90+ days.
        """
        txn_factor = min(feature_set.transaction_count / 100.0, 1.0)
        day_factor = min(feature_set.date_range_days / 90.0, 1.0)
        confidence = 0.5 * txn_factor + 0.5 * day_factor
        # Minimum baseline confidence of 0.30 even with sparse data
        return max(confidence, 0.30)


fraud_scoring_engine = FraudScoringEngine()
