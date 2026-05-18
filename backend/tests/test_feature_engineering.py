from datetime import datetime, timezone
from decimal import Decimal

from app.ml.feature_engineering import MODEL_FEATURE_COLUMNS, FinancialFeatureEngineer
from app.models.transaction import Transaction


def _transaction(
    amount: str,
    transaction_type: str,
    merchant: str,
    category: str,
    timestamp: str,
) -> Transaction:
    return Transaction(
        user_id=1,
        amount=Decimal(amount),
        transaction_type=transaction_type,
        merchant=merchant,
        category=category,
        timestamp=datetime.fromisoformat(timestamp).replace(tzinfo=timezone.utc),
    )


def test_financial_feature_engineering_generates_required_schema() -> None:
    feature_set = FinancialFeatureEngineer().generate(
        [
            _transaction("50000", "credit", "Salary", "income", "2026-01-01"),
            _transaction("51000", "credit", "Salary", "income", "2026-02-01"),
            _transaction("13000", "debit", "Rent", "housing", "2026-01-03"),
            _transaction("4200", "debit", "UPI Groceries", "food", "2026-01-11"),
            _transaction("4600", "debit", "UPI Groceries", "food", "2026-02-14"),
        ]
    )

    assert set(MODEL_FEATURE_COLUMNS).issubset(feature_set.features)
    assert feature_set.features["average_monthly_income"] == 50500
    assert feature_set.features["savings_ratio"] > 0.6
    assert feature_set.behavioral_indicators["financial_discipline_score"] > 0
    assert feature_set.category_distribution[0]["category"] in {"food", "housing"}


def test_empty_financial_feature_set_is_safe_for_inference() -> None:
    feature_set = FinancialFeatureEngineer().generate([])

    assert all(value == 0 for value in feature_set.features.values())
    assert feature_set.categorical_features["cash_flow_pattern"] == "insufficient_data"
