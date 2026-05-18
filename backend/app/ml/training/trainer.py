from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GridSearchCV, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline

from app.config.settings import get_settings
from app.ml.evaluation.metrics import evaluate_score_predictions
from app.ml.feature_engineering import (
    CATEGORICAL_FEATURE_COLUMNS,
    MODEL_FEATURE_COLUMNS,
)
from app.ml.preprocessing import FinancialPreprocessor


class SyntheticCreditDatasetGenerator:
    def __init__(self, seed: int):
        self.seed = seed

    def generate(self, rows: int) -> tuple[pd.DataFrame, np.ndarray]:
        rng = np.random.default_rng(self.seed)

        savings_ratio = rng.normal(0.22, 0.18, rows).clip(-0.45, 0.75)
        spending_to_income_ratio = (1 - savings_ratio + rng.normal(0, 0.08, rows)).clip(0.05, 1.8)
        income_stability = rng.beta(5, 2, rows).clip(0, 1)
        spending_volatility = rng.gamma(1.4, 0.28, rows).clip(0, 2.5)
        cash_flow_consistency = rng.beta(4, 2, rows).clip(0, 1)
        merchant_diversity = rng.beta(3, 4, rows).clip(0, 1)
        weekend_spending = rng.beta(2, 5, rows).clip(0, 1)
        high_risk_spending = rng.beta(1.2, 10, rows).clip(0, 0.9)
        transaction_regularity = rng.beta(4, 2.5, rows).clip(0, 1)
        recurring_income = rng.beta(5, 2, rows).clip(0, 1)
        monthly_growth = rng.normal(0.04, 0.25, rows).clip(-1, 1)

        income = rng.lognormal(mean=10.65, sigma=0.55, size=rows).clip(8_000, 300_000)
        spending = (income * spending_to_income_ratio).clip(0, 350_000)
        transaction_frequency = rng.normal(42, 18, rows).clip(1, 180)
        income_variance = (income * (1 - income_stability) * rng.uniform(0.1, 0.7, rows)) ** 2
        expense_variance = (spending * spending_volatility * rng.uniform(0.1, 0.7, rows)) ** 2

        impulsive_spending = (
            (0.45 * high_risk_spending)
            + (0.25 * weekend_spending)
            + (0.30 * rng.beta(1.8, 8, rows))
        ).clip(0, 1)
        financial_discipline = (
            (0.35 * ((savings_ratio + 0.25) / 0.75).clip(0, 1))
            + (0.20 * (1 - spending_to_income_ratio.clip(0, 1)))
            + (0.20 * cash_flow_consistency)
            + (0.15 * transaction_regularity)
            + (0.10 * (1 - impulsive_spending))
        ).clip(0, 1)

        dataframe = pd.DataFrame(
            {
                "average_monthly_income": income,
                "average_monthly_spending": spending,
                "savings_ratio": savings_ratio,
                "spending_to_income_ratio": spending_to_income_ratio,
                "transaction_frequency": transaction_frequency,
                "income_stability_score": income_stability,
                "spending_volatility": spending_volatility,
                "merchant_diversity_score": merchant_diversity,
                "cash_flow_consistency": cash_flow_consistency,
                "weekend_spending_ratio": weekend_spending,
                "high_risk_spending_frequency": high_risk_spending,
                "monthly_growth_trend": monthly_growth,
                "income_variance": income_variance,
                "expense_variance": expense_variance,
                "financial_discipline_score": financial_discipline,
                "impulsive_spending_score": impulsive_spending,
                "transaction_regularity_score": transaction_regularity,
                "recurring_income_confidence": recurring_income,
            }
        )
        dataframe["dominant_category"] = rng.choice(
            ["income", "food", "housing", "shopping", "utilities", "transport", "luxury"],
            size=rows,
            p=[0.05, 0.22, 0.20, 0.18, 0.16, 0.14, 0.05],
        )
        dataframe["cash_flow_pattern"] = np.select(
            [
                savings_ratio >= 0.25,
                savings_ratio >= 0.05,
                savings_ratio >= 0,
            ],
            ["surplus", "balanced", "thin_margin"],
            default="deficit",
        )

        raw_score = (
            300
            + (170 * financial_discipline)
            + (105 * income_stability)
            + (95 * cash_flow_consistency)
            + (75 * recurring_income)
            + (55 * transaction_regularity)
            + (45 * merchant_diversity)
            + (45 * ((monthly_growth + 1) / 2))
            - (80 * spending_to_income_ratio.clip(0, 1.8) / 1.8)
            - (65 * spending_volatility.clip(0, 2.5) / 2.5)
            - (75 * impulsive_spending)
            - (60 * high_risk_spending)
            + rng.normal(0, 18, rows)
        )
        lower_bound, upper_bound = np.percentile(raw_score, [5, 95])
        score = 300 + (600 * (raw_score - lower_bound) / max(upper_bound - lower_bound, 1))
        return dataframe, score.clip(300, 900)


class CreditModelTrainer:
    def __init__(self, model_dir: str | Path | None = None):
        settings = get_settings()
        self.settings = settings
        self.model_dir = Path(model_dir or settings.ML_MODEL_DIR)
        self.model_path = self.model_dir / "credit_score_model.joblib"
        self.metadata_path = self.model_dir / "model_metadata.json"

    def train(
        self,
        n_samples: int | None = None,
        include_optional_models: bool = True,
        tune_hyperparameters: bool = False,
    ) -> dict[str, Any]:
        sample_count = int(n_samples or self.settings.ML_SYNTHETIC_TRAINING_ROWS)
        generator = SyntheticCreditDatasetGenerator(seed=self.settings.ML_RANDOM_SEED)
        features, target = generator.generate(sample_count)
        x_train, x_validation, y_train, y_validation = train_test_split(
            features,
            target,
            test_size=0.2,
            random_state=self.settings.ML_RANDOM_SEED,
            stratify=pd.Series([self._risk_band(value) for value in target]),
        )

        candidates = self._candidate_models(include_optional_models)
        comparison: list[dict[str, Any]] = []
        best_pipeline: Pipeline | None = None
        best_report: dict[str, Any] | None = None
        best_score = -1.0

        for model_name, model in candidates:
            pipeline = Pipeline(
                steps=[
                    (
                        "preprocessor",
                        FinancialPreprocessor(
                            MODEL_FEATURE_COLUMNS,
                            CATEGORICAL_FEATURE_COLUMNS,
                        ).build(),
                    ),
                    ("model", model),
                ]
            )
            if tune_hyperparameters and model_name == "Random Forest":
                pipeline = self._tuned_random_forest(pipeline, x_train, y_train)
            else:
                pipeline.fit(x_train, y_train)

            predictions = pipeline.predict(x_validation).clip(300, 900)
            metrics = evaluate_score_predictions(y_validation, predictions)
            cv_scores = cross_val_score(
                pipeline,
                features,
                target,
                cv=3,
                scoring="neg_mean_absolute_error",
            )
            metrics["mean_absolute_error_cv"] = round(float(abs(cv_scores.mean())), 4)
            metrics["model_name"] = model_name
            comparison.append(metrics)

            selection_score = metrics["f1_score"] + metrics["accuracy"]
            if selection_score > best_score:
                best_score = selection_score
                best_pipeline = pipeline
                best_report = metrics

        if best_pipeline is None or best_report is None:
            raise RuntimeError("No trainable model candidates were available")

        created_at = datetime.now(timezone.utc).isoformat()
        model_version = f"{self.settings.ML_MODEL_VERSION}-{created_at[:10].replace('-', '')}"
        artifact = {
            "model": best_pipeline,
            "model_name": best_report["model_name"],
            "model_version": model_version,
            "created_at": created_at,
            "feature_schema": {
                "numeric": MODEL_FEATURE_COLUMNS,
                "categorical": CATEGORICAL_FEATURE_COLUMNS,
            },
            "metrics": best_report,
            "model_comparison": comparison,
            "training_metadata": {
                "sample_count": sample_count,
                "target": "synthetic continuous credit score from 300 to 900",
                "train_validation_split": "80/20 stratified by risk band",
                "cross_validation_folds": 3,
                "hyperparameter_tuning": tune_hyperparameters,
            },
        }
        self.model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(artifact, self.model_path)
        self.metadata_path.write_text(
            json.dumps({key: value for key, value in artifact.items() if key != "model"}, indent=2),
            encoding="utf-8",
        )
        return {key: value for key, value in artifact.items() if key != "model"}

    def load_metadata(self) -> dict[str, Any]:
        if self.metadata_path.exists():
            return json.loads(self.metadata_path.read_text(encoding="utf-8"))
        return {
            "model_name": "Heuristic Baseline",
            "model_version": "heuristic-baseline-v1",
            "created_at": None,
            "feature_schema": {
                "numeric": MODEL_FEATURE_COLUMNS,
                "categorical": CATEGORICAL_FEATURE_COLUMNS,
            },
            "metrics": {
                "accuracy": 0.0,
                "precision": 0.0,
                "recall": 0.0,
                "f1_score": 0.0,
                "roc_auc": 0.0,
                "confusion_matrix": [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
            },
            "model_comparison": [],
            "training_metadata": {
                "status": "No persisted model yet. Run POST /api/ml/retrain-model.",
            },
        }

    def load_artifact(self) -> dict[str, Any] | None:
        if not self.model_path.exists():
            return None
        return joblib.load(self.model_path)

    def _candidate_models(self, include_optional_models: bool):
        models: list[tuple[str, Any]] = [
            (
                "Random Forest",
                RandomForestRegressor(
                    n_estimators=120,
                    max_depth=9,
                    min_samples_leaf=5,
                    random_state=self.settings.ML_RANDOM_SEED,
                    n_jobs=1,
                ),
            )
        ]
        if not include_optional_models:
            return models

        optional_factories = [
            ("XGBoost", self._xgboost_model),
            ("LightGBM", self._lightgbm_model),
            ("CatBoost", self._catboost_model),
        ]
        for model_name, factory in optional_factories:
            model = factory()
            if model is not None:
                models.append((model_name, model))
        return models

    def _xgboost_model(self):
        try:
            from xgboost import XGBRegressor
        except ImportError:
            return None
        return XGBRegressor(
            n_estimators=160,
            max_depth=4,
            learning_rate=0.06,
            subsample=0.9,
            colsample_bytree=0.9,
            random_state=self.settings.ML_RANDOM_SEED,
            objective="reg:squarederror",
        )

    def _lightgbm_model(self):
        try:
            from lightgbm import LGBMRegressor
        except ImportError:
            return None
        return LGBMRegressor(
            n_estimators=180,
            max_depth=-1,
            learning_rate=0.05,
            random_state=self.settings.ML_RANDOM_SEED,
            verbose=-1,
        )

    def _catboost_model(self):
        try:
            from catboost import CatBoostRegressor
        except ImportError:
            return None
        return CatBoostRegressor(
            iterations=180,
            depth=5,
            learning_rate=0.05,
            loss_function="RMSE",
            random_seed=self.settings.ML_RANDOM_SEED,
            verbose=False,
        )

    def _tuned_random_forest(
        self,
        pipeline: Pipeline,
        x_train: pd.DataFrame,
        y_train: np.ndarray,
    ) -> Pipeline:
        search = GridSearchCV(
            pipeline,
            param_grid={
                "model__n_estimators": [100, 160],
                "model__max_depth": [7, 10],
                "model__min_samples_leaf": [3, 6],
            },
            cv=3,
            scoring="neg_mean_absolute_error",
            n_jobs=1,
        )
        search.fit(x_train, y_train)
        return search.best_estimator_

    def _risk_band(self, score: float) -> str:
        if score >= 750:
            return "low"
        if score >= 600:
            return "medium"
        return "high"


credit_model_trainer = CreditModelTrainer()
