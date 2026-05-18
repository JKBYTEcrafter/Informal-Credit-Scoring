from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder, StandardScaler


class OutlierClipper(BaseEstimator, TransformerMixin):
    def __init__(self, lower_quantile: float = 0.01, upper_quantile: float = 0.99):
        self.lower_quantile = lower_quantile
        self.upper_quantile = upper_quantile

    def fit(self, x_values, y=None):  # noqa: ANN001
        array = np.asarray(x_values, dtype=float)
        self.lower_bounds_ = np.nanquantile(array, self.lower_quantile, axis=0)
        self.upper_bounds_ = np.nanquantile(array, self.upper_quantile, axis=0)
        return self

    def transform(self, x_values):  # noqa: ANN001
        array = np.asarray(x_values, dtype=float)
        return np.clip(array, self.lower_bounds_, self.upper_bounds_)


class FinancialPreprocessor:
    def __init__(self, numeric_features: list[str], categorical_features: list[str]):
        self.numeric_features = numeric_features
        self.categorical_features = categorical_features

    def build(self) -> ColumnTransformer:
        numeric_pipeline = Pipeline(
            steps=[
                ("missing_values", SimpleImputer(strategy="median")),
                ("outlier_detection", OutlierClipper()),
                ("standard_scaling", StandardScaler()),
                ("normalization", MinMaxScaler()),
            ]
        )
        categorical_pipeline = Pipeline(
            steps=[
                ("missing_values", SimpleImputer(strategy="most_frequent")),
                (
                    "categorical_encoding",
                    OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                ),
            ]
        )
        return ColumnTransformer(
            transformers=[
                ("numeric", numeric_pipeline, self.numeric_features),
                ("categorical", categorical_pipeline, self.categorical_features),
            ],
            remainder="drop",
            verbose_feature_names_out=True,
        )

    def fit_transform(self, dataframe: pd.DataFrame):
        return self.build().fit_transform(dataframe)
