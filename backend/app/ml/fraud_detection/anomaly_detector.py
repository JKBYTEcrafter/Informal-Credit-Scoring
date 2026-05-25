from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np

from app.ml.fraud_detection.fraud_feature_engineer import FraudFeatureSet

logger = logging.getLogger(__name__)

FEATURE_KEYS: list[str] = [
    "transaction_velocity",
    "spending_spike_ratio",
    "merchant_concentration_score",
    "nighttime_transaction_ratio",
    "unusual_category_score",
    "high_freq_withdrawal_score",
    "transaction_entropy",
    "weekend_anomaly_score",
    "amount_zscore_max",
    "velocity_acceleration",
    "merchant_novelty_score",
    "category_drift_score",
    "round_number_ratio",
    "rapid_balance_depletion",
    "behavioral_fingerprint_deviation",
]

# Risk-weight per feature for rule-based fallback (higher = more anomalous when elevated)
_FEATURE_WEIGHTS: dict[str, float] = {
    "transaction_velocity": 0.10,
    "spending_spike_ratio": 0.12,
    "merchant_concentration_score": 0.08,
    "nighttime_transaction_ratio": 0.09,
    "unusual_category_score": 0.05,
    "high_freq_withdrawal_score": 0.07,
    "transaction_entropy": 0.04,
    "weekend_anomaly_score": 0.04,
    "amount_zscore_max": 0.10,
    "velocity_acceleration": 0.08,
    "merchant_novelty_score": 0.06,
    "category_drift_score": 0.07,
    "round_number_ratio": 0.05,
    "rapid_balance_depletion": 0.10,
    "behavioral_fingerprint_deviation": 0.08,
}


@dataclass
class AnomalyDetectionResult:
    isolation_forest_score: float  # 0-1, probability of being anomalous
    svm_score: float
    lof_score: float
    ensemble_score: float  # 0.5*IF + 0.3*SVM + 0.2*LOF
    is_anomalous: bool  # ensemble_score > 0.5


class FraudAnomalyDetector:
    """
    Ensemble anomaly detector: Isolation Forest + One-Class SVM + LOF.
    Falls back to rule-based scoring if trained models are unavailable.
    """

    def __init__(self) -> None:
        self._models: dict | None = None

    def load_models(self, model_dir: Path) -> bool:
        """Attempt to load trained ensemble from disk. Returns True if successful."""
        try:
            if_path = model_dir / "isolation_forest.joblib"
            svm_path = model_dir / "one_class_svm.joblib"
            lof_path = model_dir / "local_outlier_factor.joblib"

            if not (if_path.exists() and svm_path.exists() and lof_path.exists()):
                return False

            self._models = {
                "isolation_forest": joblib.load(if_path),
                "one_class_svm": joblib.load(svm_path),
                "lof": joblib.load(lof_path),
            }
            return True
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not load fraud models: %s", exc)
            self._models = None
            return False

    def detect(self, feature_set: FraudFeatureSet, model_dir: Path) -> AnomalyDetectionResult:
        """Run anomaly detection — model-based when available, else rule-based fallback."""
        if self._models is None:
            self.load_models(model_dir)

        feature_vector = np.array(
            [feature_set.features.get(k, 0.0) for k in FEATURE_KEYS],
            dtype=np.float64,
        ).reshape(1, -1)

        if self._models is not None:
            if_score = self._infer_if(feature_vector)
            svm_score = self._infer_svm(feature_vector)
            lof_score = self._infer_lof(feature_vector)
        else:
            # Rule-based fallback: weighted feature magnitude
            if_score = self._rule_based_score(feature_set)
            svm_score = if_score * 0.95
            lof_score = if_score * 0.90

        ensemble = 0.5 * if_score + 0.3 * svm_score + 0.2 * lof_score
        ensemble = float(np.clip(ensemble, 0.0, 1.0))

        return AnomalyDetectionResult(
            isolation_forest_score=round(if_score, 4),
            svm_score=round(svm_score, 4),
            lof_score=round(lof_score, 4),
            ensemble_score=round(ensemble, 4),
            is_anomalous=ensemble > 0.5,
        )

    # ------------------------------------------------------------------
    # Private: model inference helpers
    # ------------------------------------------------------------------

    def _infer_if(self, X: np.ndarray) -> float:
        """Isolation Forest: convert decision_function to 0-1 anomaly probability."""
        try:
            model = self._models["isolation_forest"]  # type: ignore[index]
            # decision_function: negative scores = more anomalous
            score = float(model.decision_function(X)[0])
            # Normalise: typical range is roughly [-0.5, 0.5]
            normalised = float(np.clip((-score + 0.5) / 1.0, 0.0, 1.0))
            return normalised
        except Exception as exc:  # noqa: BLE001
            logger.debug("IF inference error: %s", exc)
            return 0.3

    def _infer_svm(self, X: np.ndarray) -> float:
        """One-Class SVM: decision function to 0-1."""
        try:
            model = self._models["one_class_svm"]  # type: ignore[index]
            score = float(model.decision_function(X)[0])
            normalised = float(np.clip((-score + 1.0) / 2.0, 0.0, 1.0))
            return normalised
        except Exception as exc:  # noqa: BLE001
            logger.debug("SVM inference error: %s", exc)
            return 0.3

    def _infer_lof(self, X: np.ndarray) -> float:
        """LOF: predict returns -1 (anomaly) or 1 (normal)."""
        try:
            model = self._models["lof"]  # type: ignore[index]
            pred = int(model.predict(X)[0])
            # LOF decision_function may not be available in older sklearn
            try:
                score = float(model.decision_function(X)[0])
                normalised = float(np.clip((-score + 1.0) / 2.0, 0.0, 1.0))
            except AttributeError:
                normalised = 0.8 if pred == -1 else 0.2
            return normalised
        except Exception as exc:  # noqa: BLE001
            logger.debug("LOF inference error: %s", exc)
            return 0.3

    def _rule_based_score(self, feature_set: FraudFeatureSet) -> float:
        """Weighted linear combination of feature values as anomaly proxy."""
        total_weight = sum(_FEATURE_WEIGHTS.values())
        score = sum(
            feature_set.features.get(k, 0.0) * w
            for k, w in _FEATURE_WEIGHTS.items()
        )
        return float(np.clip(score / total_weight, 0.0, 1.0))


fraud_anomaly_detector = FraudAnomalyDetector()
