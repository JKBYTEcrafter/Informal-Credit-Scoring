import pandas as pd

from app.ml.feature_engineering import CATEGORICAL_FEATURE_COLUMNS, MODEL_FEATURE_COLUMNS
from app.ml.preprocessing import FinancialPreprocessor


def test_preprocessor_handles_missing_values_outliers_and_categories() -> None:
    dataframe = pd.DataFrame(
        [
            {
                **{feature: 0.5 for feature in MODEL_FEATURE_COLUMNS},
                "average_monthly_income": 40_000,
                "average_monthly_spending": 20_000,
                "dominant_category": "food",
                "cash_flow_pattern": "balanced",
            },
            {
                **{feature: None for feature in MODEL_FEATURE_COLUMNS},
                "average_monthly_income": 20_000_000,
                "dominant_category": None,
                "cash_flow_pattern": "surplus",
            },
        ]
    )

    transformed = FinancialPreprocessor(
        MODEL_FEATURE_COLUMNS,
        CATEGORICAL_FEATURE_COLUMNS,
    ).fit_transform(dataframe)

    assert transformed.shape[0] == 2
    assert not pd.isna(transformed).any()
