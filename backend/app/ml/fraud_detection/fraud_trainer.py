from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM

from app.config.settings import get_settings

logger = logging.getLogger(__name__)

_FEATURE_KEYS: list[str] = [
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

N_FEATURES = len(_FEATURE_KEYS)


class FraudModelTrainer:
    """
    Trains, evaluates, and persists the Isolation Forest, One-Class SVM,
    and Local Outlier Factor models for fraud anomaly detection.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.model_dir = Path(settings.FRAUD_MODEL_DIR)
        self.random_seed = settings.ML_RANDOM_SEED

    def train(self) -> dict[str, Any]:
        """
        Train all three anomaly detection models on synthetic fraud data.
        Returns metrics dict.
        """
        self.model_dir.mkdir(parents=True, exist_ok=True)
        rng = np.random.default_rng(self.random_seed)

        # -----------------------------------------------------------------
        # Synthetic dataset generation
        # -----------------------------------------------------------------
        n_normal = 500
        n_anomalous = 100

        # Normal samples: features drawn from low-fraud distributions
        normal = np.column_stack([
            rng.normal(0.05, 0.04, n_normal).clip(0, 1),   # velocity
            rng.normal(0.10, 0.08, n_normal).clip(0, 1),   # spike
            rng.normal(0.30, 0.10, n_normal).clip(0, 1),   # merchant_conc
            rng.normal(0.04, 0.03, n_normal).clip(0, 1),   # nighttime
            rng.normal(0.15, 0.07, n_normal).clip(0, 1),   # unusual_cat
            rng.normal(0.55, 0.10, n_normal).clip(0, 1),   # withdrawal
            rng.normal(0.60, 0.15, n_normal).clip(0, 1),   # entropy
            rng.normal(0.30, 0.10, n_normal).clip(0, 1),   # weekend
            rng.normal(0.10, 0.08, n_normal).clip(0, 1),   # zscore
            rng.normal(0.50, 0.10, n_normal).clip(0, 1),   # accel
            rng.normal(0.35, 0.12, n_normal).clip(0, 1),   # novelty
            rng.normal(0.10, 0.08, n_normal).clip(0, 1),   # drift
            rng.normal(0.20, 0.10, n_normal).clip(0, 1),   # round
            rng.normal(0.05, 0.04, n_normal).clip(0, 1),   # depletion
            rng.normal(0.10, 0.07, n_normal).clip(0, 1),   # fingerprint_dev
        ])

        # Anomalous samples: elevated values in fraud-indicative features
        anomalous = np.column_stack([
            rng.normal(0.60, 0.15, n_anomalous).clip(0, 1),  # velocity: high
            rng.normal(0.75, 0.12, n_anomalous).clip(0, 1),  # spike: high
            rng.normal(0.80, 0.10, n_anomalous).clip(0, 1),  # merchant_conc: very high
            rng.normal(0.50, 0.15, n_anomalous).clip(0, 1),  # nighttime: high
            rng.normal(0.60, 0.15, n_anomalous).clip(0, 1),  # unusual_cat
            rng.normal(0.85, 0.08, n_anomalous).clip(0, 1),  # withdrawal: very high
            rng.normal(0.20, 0.10, n_anomalous).clip(0, 1),  # entropy: low (concentrated)
            rng.normal(0.65, 0.12, n_anomalous).clip(0, 1),  # weekend
            rng.normal(0.75, 0.10, n_anomalous).clip(0, 1),  # zscore: high
            rng.normal(0.80, 0.10, n_anomalous).clip(0, 1),  # accel: high
            rng.normal(0.80, 0.10, n_anomalous).clip(0, 1),  # novelty: high
            rng.normal(0.65, 0.12, n_anomalous).clip(0, 1),  # drift: high
            rng.normal(0.75, 0.12, n_anomalous).clip(0, 1),  # round: high
            rng.normal(0.70, 0.12, n_anomalous).clip(0, 1),  # depletion: high
            rng.normal(0.75, 0.10, n_anomalous).clip(0, 1),  # fingerprint_dev: high
        ])

        # Training data is normal only (unsupervised)
        X_train = normal.copy()
        # Full dataset for evaluation
        X_eval = np.vstack([normal, anomalous])
        y_eval = np.array([1] * n_normal + [-1] * n_anomalous)  # 1=normal, -1=anomaly

        # -----------------------------------------------------------------
        # Train models
        # -----------------------------------------------------------------
        contamination = n_anomalous / (n_normal + n_anomalous)

        if_model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=self.random_seed,
        )
        if_model.fit(X_train)

        svm_model = OneClassSVM(kernel="rbf", gamma="scale", nu=contamination)
        svm_model.fit(X_train)

        lof_model = LocalOutlierFactor(
            n_neighbors=20,
            contamination=contamination,
            novelty=True,
        )
        lof_model.fit(X_train)

        # -----------------------------------------------------------------
        # Evaluate
        # -----------------------------------------------------------------
        metrics: dict[str, Any] = {}
        for name, model in [
            ("isolation_forest", if_model),
            ("one_class_svm", svm_model),
            ("lof", lof_model),
        ]:
            preds = model.predict(X_eval)  # 1 or -1
            tp = int(((preds == -1) & (y_eval == -1)).sum())
            fp = int(((preds == -1) & (y_eval == 1)).sum())
            fn = int(((preds == 1) & (y_eval == -1)).sum())
            precision = tp / max(tp + fp, 1)
            recall = tp / max(tp + fn, 1)
            f1 = 2 * precision * recall / max(precision + recall, 1e-9)
            metrics[name] = {
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1": round(f1, 4),
                "true_positives": tp,
                "false_positives": fp,
                "false_negatives": fn,
            }

        # -----------------------------------------------------------------
        # Persist models
        # -----------------------------------------------------------------
        joblib.dump(if_model, self.model_dir / "isolation_forest.joblib")
        joblib.dump(svm_model, self.model_dir / "one_class_svm.joblib")
        joblib.dump(lof_model, self.model_dir / "local_outlier_factor.joblib")

        metadata: dict[str, Any] = {
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "n_estimators": 100,
            "contamination": round(contamination, 4),
            "n_normal_samples": n_normal,
            "n_anomalous_samples": n_anomalous,
            "feature_keys": _FEATURE_KEYS,
            "model_version": "fraud-ensemble-v1",
            "metrics": metrics,
        }
        (self.model_dir / "metadata.json").write_text(json.dumps(metadata, indent=2))

        logger.info("Fraud models trained and saved to %s", self.model_dir)
        return metadata

    def load_artifact(self) -> dict[str, Any] | None:
        """Load persisted model metadata. Returns None if not trained."""
        meta_path = self.model_dir / "metadata.json"
        if not meta_path.exists():
            return None
        try:
            return json.loads(meta_path.read_text())
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not read fraud metadata: %s", exc)
            return None

    def load_metadata(self) -> dict[str, Any]:
        """Load metadata or return defaults."""
        artifact = self.load_artifact()
        if artifact is None:
            return {
                "trained_at": None,
                "n_estimators": 100,
                "contamination": 0.1667,
                "model_version": "heuristic-v1",
                "metrics": {},
            }
        return artifact

    def get_metrics(self) -> dict[str, Any]:
        """Return current model status and metrics."""
        artifact = self.load_artifact()
        if artifact is None:
            return {
                "status": "not_trained",
                "model_version": "heuristic-v1",
                "trained_at": None,
                "metrics": {},
            }
        return {
            "status": "trained",
            "model_version": artifact.get("model_version", "fraud-ensemble-v1"),
            "trained_at": artifact.get("trained_at"),
            "n_estimators": artifact.get("n_estimators", 100),
            "contamination": artifact.get("contamination", 0.1667),
            "metrics": artifact.get("metrics", {}),
        }


fraud_model_trainer = FraudModelTrainer()
