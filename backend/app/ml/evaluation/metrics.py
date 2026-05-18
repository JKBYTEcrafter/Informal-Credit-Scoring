from __future__ import annotations

import warnings

import numpy as np
from sklearn.exceptions import UndefinedMetricWarning
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

RISK_CLASS_ORDER = ["High Risk", "Medium Risk", "Low Risk"]


def classify_score(score: float) -> str:
    if score >= 750:
        return "Low Risk"
    if score >= 600:
        return "Medium Risk"
    return "High Risk"


def _class_index(score: float) -> int:
    risk_level = classify_score(float(score))
    return RISK_CLASS_ORDER.index(risk_level)


def _risk_probabilities(scores: np.ndarray) -> np.ndarray:
    centers = np.array([500.0, 675.0, 825.0])
    distances = -np.abs(scores.reshape(-1, 1) - centers.reshape(1, -1)) / 90.0
    distances = distances - distances.max(axis=1, keepdims=True)
    exp_values = np.exp(distances)
    return exp_values / exp_values.sum(axis=1, keepdims=True)


def evaluate_score_predictions(y_true_scores, y_pred_scores) -> dict:
    y_true = np.array([_class_index(score) for score in y_true_scores])
    y_pred = np.array([_class_index(score) for score in y_pred_scores])
    y_pred_scores = np.asarray(y_pred_scores, dtype=float)

    metrics = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(
            float(precision_score(y_true, y_pred, average="weighted", zero_division=0)),
            4,
        ),
        "recall": round(
            float(recall_score(y_true, y_pred, average="weighted", zero_division=0)),
            4,
        ),
        "f1_score": round(
            float(f1_score(y_true, y_pred, average="weighted", zero_division=0)),
            4,
        ),
        "confusion_matrix": confusion_matrix(
            y_true,
            y_pred,
            labels=[0, 1, 2],
        ).tolist(),
    }

    try:
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UndefinedMetricWarning)
            roc_auc = float(
                roc_auc_score(
                    y_true,
                    _risk_probabilities(y_pred_scores),
                    multi_class="ovr",
                    labels=[0, 1, 2],
                )
            )
        metrics["roc_auc"] = 0.0 if np.isnan(roc_auc) else round(roc_auc, 4)
    except ValueError:
        metrics["roc_auc"] = 0.0
    return metrics
