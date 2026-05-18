from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from math import log1p
from typing import Any

import numpy as np
import pandas as pd

from app.models.transaction import Transaction

MODEL_FEATURE_COLUMNS = [
    "average_monthly_income",
    "average_monthly_spending",
    "savings_ratio",
    "spending_to_income_ratio",
    "transaction_frequency",
    "income_stability_score",
    "spending_volatility",
    "merchant_diversity_score",
    "cash_flow_consistency",
    "weekend_spending_ratio",
    "high_risk_spending_frequency",
    "monthly_growth_trend",
    "income_variance",
    "expense_variance",
    "financial_discipline_score",
    "impulsive_spending_score",
    "transaction_regularity_score",
    "recurring_income_confidence",
]

CATEGORICAL_FEATURE_COLUMNS = ["dominant_category", "cash_flow_pattern"]

HIGH_RISK_CATEGORIES = {
    "gambling",
    "betting",
    "casino",
    "alcohol",
    "tobacco",
    "nightlife",
    "luxury",
    "cash_advance",
    "late_fee",
}


@dataclass(frozen=True)
class FinancialFeatureSet:
    features: dict[str, float]
    categorical_features: dict[str, str]
    category_distribution: list[dict[str, float | str]]
    monthly_cash_flow: list[dict[str, float | str]]
    behavioral_indicators: dict[str, float]


class FinancialFeatureEngineer:
    def generate(self, transactions: list[Transaction]) -> FinancialFeatureSet:
        if not transactions:
            return self._empty_feature_set()

        dataframe = self._to_dataframe(transactions)
        if dataframe.empty:
            return self._empty_feature_set()

        dataframe["month"] = dataframe["timestamp"].dt.tz_convert(None).dt.to_period("M").astype(str)
        dataframe["weekday"] = dataframe["timestamp"].dt.weekday

        income_df = dataframe[dataframe["transaction_type"] == "credit"].copy()
        expense_df = dataframe[dataframe["transaction_type"] == "debit"].copy()

        monthly = (
            dataframe.pivot_table(
                index="month",
                columns="transaction_type",
                values="amount",
                aggfunc="sum",
                fill_value=0.0,
            )
            .rename_axis(columns=None)
            .sort_index()
        )
        if "credit" not in monthly:
            monthly["credit"] = 0.0
        if "debit" not in monthly:
            monthly["debit"] = 0.0
        monthly["net_cash_flow"] = monthly["credit"] - monthly["debit"]

        month_count = max(int(dataframe["month"].nunique()), 1)
        total_income = float(income_df["amount"].sum())
        total_expenses = float(expense_df["amount"].sum())
        average_monthly_income = float(monthly["credit"].mean())
        average_monthly_spending = float(monthly["debit"].mean())
        savings_ratio = self._safe_ratio(total_income - total_expenses, total_income)
        spending_to_income_ratio = self._safe_ratio(total_expenses, total_income)
        transaction_frequency = float(len(dataframe.index) / month_count)

        income_variance = float(monthly["credit"].var(ddof=0))
        expense_variance = float(monthly["debit"].var(ddof=0))
        income_stability_score = self._inverse_variation(monthly["credit"])
        spending_volatility = self._coefficient_of_variation(monthly["debit"])
        merchant_diversity_score = self._clip01(
            dataframe["merchant"].nunique() / max(len(dataframe.index), 1)
        )
        cash_flow_consistency = self._inverse_variation(monthly["net_cash_flow"].abs())
        weekend_spending_ratio = self._safe_ratio(
            float(expense_df[expense_df["weekday"].isin([5, 6])]["amount"].sum()),
            total_expenses,
        )
        high_risk_spending_frequency = self._safe_ratio(
            float(expense_df["category"].isin(HIGH_RISK_CATEGORIES).sum()),
            float(len(expense_df.index)),
        )
        monthly_growth_trend = self._monthly_growth_trend(monthly["net_cash_flow"])
        transaction_regularity_score = self._transaction_regularity_score(dataframe)
        recurring_income_confidence = self._recurring_income_confidence(
            income_df,
            month_count,
            income_stability_score,
        )
        impulsive_spending_score = self._clip01(
            (0.45 * high_risk_spending_frequency)
            + (0.25 * weekend_spending_ratio)
            + (0.30 * self._large_expense_ratio(expense_df))
        )
        financial_discipline_score = self._clip01(
            (0.35 * self._normalize_ratio(savings_ratio))
            + (0.20 * (1 - self._clip01(spending_to_income_ratio)))
            + (0.20 * cash_flow_consistency)
            + (0.15 * transaction_regularity_score)
            + (0.10 * (1 - impulsive_spending_score))
        )

        features = self._with_schema_defaults(
            {
                "average_monthly_income": average_monthly_income,
                "average_monthly_spending": average_monthly_spending,
                "savings_ratio": savings_ratio,
                "spending_to_income_ratio": spending_to_income_ratio,
                "transaction_frequency": transaction_frequency,
                "income_stability_score": income_stability_score,
                "spending_volatility": spending_volatility,
                "merchant_diversity_score": merchant_diversity_score,
                "cash_flow_consistency": cash_flow_consistency,
                "weekend_spending_ratio": weekend_spending_ratio,
                "high_risk_spending_frequency": high_risk_spending_frequency,
                "monthly_growth_trend": monthly_growth_trend,
                "income_variance": income_variance,
                "expense_variance": expense_variance,
                "financial_discipline_score": financial_discipline_score,
                "impulsive_spending_score": impulsive_spending_score,
                "transaction_regularity_score": transaction_regularity_score,
                "recurring_income_confidence": recurring_income_confidence,
            }
        )
        category_distribution = self._category_distribution(expense_df)
        dominant_category = (
            str(category_distribution[0]["category"]) if category_distribution else "none"
        )
        categorical_features = {
            "dominant_category": dominant_category,
            "cash_flow_pattern": self._cash_flow_pattern(savings_ratio),
        }

        return FinancialFeatureSet(
            features=features,
            categorical_features=categorical_features,
            category_distribution=category_distribution,
            monthly_cash_flow=self._monthly_cash_flow(monthly),
            behavioral_indicators={
                "financial_discipline_score": financial_discipline_score,
                "impulsive_spending_score": impulsive_spending_score,
                "transaction_regularity_score": transaction_regularity_score,
                "recurring_income_confidence": recurring_income_confidence,
            },
        )

    def feature_frame(self, feature_set: FinancialFeatureSet) -> pd.DataFrame:
        row: dict[str, Any] = {
            column: feature_set.features.get(column, 0.0)
            for column in MODEL_FEATURE_COLUMNS
        }
        row.update(
            {
                column: feature_set.categorical_features.get(column, "unknown")
                for column in CATEGORICAL_FEATURE_COLUMNS
            }
        )
        return pd.DataFrame([row])

    def _to_dataframe(self, transactions: list[Transaction]) -> pd.DataFrame:
        rows = []
        for transaction in transactions:
            timestamp = transaction.timestamp
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp)
            rows.append(
                {
                    "amount": float(Decimal(str(transaction.amount))),
                    "transaction_type": transaction.transaction_type,
                    "merchant": (transaction.merchant or "unknown").strip(),
                    "category": (transaction.category or "uncategorized").strip().lower(),
                    "timestamp": timestamp,
                }
            )
        dataframe = pd.DataFrame(rows)
        dataframe["timestamp"] = pd.to_datetime(
            dataframe["timestamp"],
            errors="coerce",
            utc=True,
        )
        return dataframe.dropna(subset=["timestamp"])

    def _empty_feature_set(self) -> FinancialFeatureSet:
        return FinancialFeatureSet(
            features=self._with_schema_defaults({}),
            categorical_features={
                "dominant_category": "none",
                "cash_flow_pattern": "insufficient_data",
            },
            category_distribution=[],
            monthly_cash_flow=[],
            behavioral_indicators={
                "financial_discipline_score": 0.0,
                "impulsive_spending_score": 0.0,
                "transaction_regularity_score": 0.0,
                "recurring_income_confidence": 0.0,
            },
        )

    def _with_schema_defaults(self, features: dict[str, float]) -> dict[str, float]:
        return {
            column: round(float(features.get(column, 0.0)), 6)
            for column in MODEL_FEATURE_COLUMNS
        }

    def _safe_ratio(self, numerator: float, denominator: float) -> float:
        if denominator <= 0:
            return 0.0
        return float(numerator / denominator)

    def _clip01(self, value: float) -> float:
        return float(max(0.0, min(1.0, value)))

    def _normalize_ratio(self, value: float) -> float:
        return self._clip01((value + 0.25) / 0.75)

    def _coefficient_of_variation(self, values: pd.Series) -> float:
        mean = float(values.mean())
        if mean <= 0:
            return 0.0
        return float(values.std(ddof=0) / mean)

    def _inverse_variation(self, values: pd.Series) -> float:
        return self._clip01(1.0 - self._coefficient_of_variation(values))

    def _monthly_growth_trend(self, values: pd.Series) -> float:
        if len(values.index) < 2:
            return 0.0
        x_axis = np.arange(len(values.index), dtype=float)
        slope = float(np.polyfit(x_axis, values.astype(float), 1)[0])
        scale = max(float(values.abs().mean()), 1.0)
        return float(max(-1.0, min(1.0, slope / scale)))

    def _transaction_regularity_score(self, dataframe: pd.DataFrame) -> float:
        ordered = dataframe.sort_values("timestamp")
        if len(ordered.index) < 3:
            return 0.5 if len(ordered.index) > 0 else 0.0
        gaps = ordered["timestamp"].diff().dt.total_seconds().dropna() / 86400
        mean_gap = float(gaps.mean())
        if mean_gap <= 0:
            return 1.0
        return self._clip01(1.0 - float(gaps.std(ddof=0) / mean_gap))

    def _recurring_income_confidence(
        self,
        income_df: pd.DataFrame,
        month_count: int,
        income_stability_score: float,
    ) -> float:
        if income_df.empty:
            return 0.0
        monthly_income_coverage = self._safe_ratio(
            float(income_df["month"].nunique()),
            float(month_count),
        )
        merchant_repetition = self._clip01(
            income_df["merchant"].value_counts(normalize=True).max()
        )
        return self._clip01(
            (0.45 * monthly_income_coverage)
            + (0.35 * income_stability_score)
            + (0.20 * merchant_repetition)
        )

    def _large_expense_ratio(self, expense_df: pd.DataFrame) -> float:
        if expense_df.empty:
            return 0.0
        median = float(expense_df["amount"].median())
        if median <= 0:
            return 0.0
        large_count = int((expense_df["amount"] > median * 2.5).sum())
        return self._safe_ratio(float(large_count), float(len(expense_df.index)))

    def _category_distribution(self, expense_df: pd.DataFrame) -> list[dict[str, float | str]]:
        if expense_df.empty:
            return []
        grouped = (
            expense_df.groupby("category")["amount"]
            .sum()
            .sort_values(ascending=False)
            .head(8)
        )
        total = max(float(grouped.sum()), 1.0)
        return [
            {
                "category": str(category),
                "total_spent": round(float(amount), 2),
                "ratio": round(float(amount) / total, 4),
            }
            for category, amount in grouped.items()
        ]

    def _monthly_cash_flow(self, monthly: pd.DataFrame) -> list[dict[str, float | str]]:
        return [
            {
                "month": str(month),
                "income": round(float(row["credit"]), 2),
                "expenses": round(float(row["debit"]), 2),
                "net_cash_flow": round(float(row["net_cash_flow"]), 2),
            }
            for month, row in monthly.tail(12).iterrows()
        ]

    def _cash_flow_pattern(self, savings_ratio: float) -> str:
        if savings_ratio >= 0.25:
            return "surplus"
        if savings_ratio >= 0.05:
            return "balanced"
        if savings_ratio >= 0:
            return "thin_margin"
        return "deficit"


financial_feature_engineer = FinancialFeatureEngineer()
