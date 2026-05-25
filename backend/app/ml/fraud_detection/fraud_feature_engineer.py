from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal

import numpy as np
import pandas as pd

from app.models.transaction import Transaction


@dataclass
class FraudFeatureSet:
    """Container for fraud-specific feature extraction output."""

    features: dict[str, float]
    transaction_count: int
    date_range_days: int


class FraudFeatureEngineer:
    """
    Extracts 15 fraud-specific behavioral features from a user's transaction list.
    All features are designed to detect anomalous patterns indicating potential fraud.
    """

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

    def generate(self, transactions: list[Transaction]) -> FraudFeatureSet:
        """Extract all 15 fraud features from transaction history."""
        if not transactions:
            return FraudFeatureSet(
                features=self._empty_feature_set(),
                transaction_count=0,
                date_range_days=0,
            )

        # Build DataFrame for vectorised analysis
        records = []
        for txn in transactions:
            ts = txn.timestamp
            if ts.tzinfo is None:
                ts = ts.replace(tzinfo=timezone.utc)
            records.append(
                {
                    "amount": float(txn.amount) if txn.amount is not None else 0.0,
                    "transaction_type": (txn.transaction_type or "").lower(),
                    "merchant": txn.merchant or "unknown",
                    "category": txn.category or "unknown",
                    "timestamp": ts,
                }
            )

        df = pd.DataFrame(records)
        df["date"] = df["timestamp"].dt.date
        df["hour"] = df["timestamp"].dt.hour
        df["weekday"] = df["timestamp"].dt.weekday  # 0=Mon … 6=Sun

        n = len(df)
        dates = df["date"].unique()
        date_range_days = max(
            (max(dates) - min(dates)).days + 1,
            1,
        )

        debit_df = df[df["transaction_type"] == "debit"]
        credit_df = df[df["transaction_type"] == "credit"]

        # ---------------------------------------------------------------
        # Feature 1: transaction_velocity
        # ---------------------------------------------------------------
        velocity = n / date_range_days  # transactions per day
        f_velocity = float(np.clip(velocity / 20.0, 0.0, 1.0))

        # ---------------------------------------------------------------
        # Feature 2: spending_spike_ratio
        # ---------------------------------------------------------------
        daily_spend = debit_df.groupby("date")["amount"].sum()
        if len(daily_spend) > 1:
            avg_daily = daily_spend.mean()
            max_daily = daily_spend.max()
            spike = (max_daily / avg_daily) if avg_daily > 0 else 1.0
            spike = min(spike, 10.0)
        else:
            spike = 1.0
        f_spike = float(np.clip((spike - 1.0) / 9.0, 0.0, 1.0))

        # ---------------------------------------------------------------
        # Feature 3: merchant_concentration_score
        # ---------------------------------------------------------------
        merchant_counts = df["merchant"].value_counts()
        if len(merchant_counts) > 0 and n > 0:
            top_merchant_share = merchant_counts.iloc[0] / n
        else:
            top_merchant_share = 0.0
        f_merchant_conc = float(np.clip(top_merchant_share, 0.0, 1.0))

        # ---------------------------------------------------------------
        # Feature 4: nighttime_transaction_ratio
        # ---------------------------------------------------------------
        nighttime_mask = (df["hour"] >= 22) | (df["hour"] < 6)
        f_nighttime = float(nighttime_mask.sum() / n) if n > 0 else 0.0

        # ---------------------------------------------------------------
        # Feature 5: unusual_category_score
        # ---------------------------------------------------------------
        unique_cats = df["category"].nunique()
        f_unusual_cat = float(np.clip(unique_cats / max(n, 1), 0.0, 1.0))

        # ---------------------------------------------------------------
        # Feature 6: high_freq_withdrawal_score
        # ---------------------------------------------------------------
        debit_count = len(debit_df)
        f_withdrawal = float(debit_count / n) if n > 0 else 0.0

        # ---------------------------------------------------------------
        # Feature 7: transaction_entropy
        # ---------------------------------------------------------------
        if len(merchant_counts) > 0:
            probs = merchant_counts.values / merchant_counts.values.sum()
            entropy = -float(np.sum(probs * np.log2(probs + 1e-10)))
            max_entropy = math.log2(len(merchant_counts)) if len(merchant_counts) > 1 else 1.0
            f_entropy = float(np.clip(entropy / max_entropy if max_entropy > 0 else 0.0, 0.0, 1.0))
        else:
            f_entropy = 0.0

        # ---------------------------------------------------------------
        # Feature 8: weekend_anomaly_score
        # ---------------------------------------------------------------
        weekend_mask = df["weekday"] >= 5  # Sat=5, Sun=6
        weekend_debit = debit_df[debit_df["weekday"] >= 5]["amount"].sum()
        total_debit_amount = debit_df["amount"].sum()
        f_weekend = float(weekend_debit / total_debit_amount) if total_debit_amount > 0 else 0.0
        f_weekend = float(np.clip(f_weekend, 0.0, 1.0))

        # ---------------------------------------------------------------
        # Feature 9: amount_zscore_max
        # ---------------------------------------------------------------
        amounts = df["amount"].values
        if len(amounts) > 1:
            mean_a = amounts.mean()
            std_a = amounts.std()
            if std_a > 0:
                zscores = np.abs((amounts - mean_a) / std_a)
                max_z = float(min(zscores.max(), 5.0))
            else:
                max_z = 0.0
        else:
            max_z = 0.0
        f_zscore = float(np.clip(max_z / 5.0, 0.0, 1.0))

        # ---------------------------------------------------------------
        # Feature 10: velocity_acceleration
        # ---------------------------------------------------------------
        df_sorted = df.sort_values("timestamp")
        half = len(df_sorted) // 2
        if half > 0 and date_range_days > 1:
            half_days = max(date_range_days // 2, 1)
            first_rate = (half) / half_days
            second_rate = (n - half) / half_days
            accel = (second_rate - first_rate) / max(first_rate, 1.0)
            f_accel = float(np.clip((accel + 1.0) / 2.0, 0.0, 1.0))
        else:
            f_accel = 0.5

        # ---------------------------------------------------------------
        # Feature 11: merchant_novelty_score
        # ---------------------------------------------------------------
        single_txn_merchants = (merchant_counts == 1).sum()
        total_merchants = len(merchant_counts)
        f_novelty = float(single_txn_merchants / total_merchants) if total_merchants > 0 else 0.0

        # ---------------------------------------------------------------
        # Feature 12: category_drift_score
        # ---------------------------------------------------------------
        df_sorted2 = df.sort_values("timestamp").reset_index(drop=True)
        mid = len(df_sorted2) // 2
        if mid > 0:
            first_half_cat = df_sorted2.iloc[:mid]["category"].value_counts(normalize=True)
            second_half_cat = df_sorted2.iloc[mid:]["category"].value_counts(normalize=True)
            dominant_first = first_half_cat.index[0] if len(first_half_cat) > 0 else ""
            share_first = float(first_half_cat.iloc[0]) if len(first_half_cat) > 0 else 0.0
            share_second = float(second_half_cat.get(dominant_first, 0.0))
            f_drift = float(np.clip(abs(share_first - share_second), 0.0, 1.0))
        else:
            f_drift = 0.0

        # ---------------------------------------------------------------
        # Feature 13: round_number_ratio
        # ---------------------------------------------------------------
        round_mask = (df["amount"] % 100 == 0) | (df["amount"] % 1000 == 0)
        f_round = float(round_mask.sum() / n) if n > 0 else 0.0

        # ---------------------------------------------------------------
        # Feature 14: rapid_balance_depletion
        # ---------------------------------------------------------------
        avg_monthly_income = 0.0
        if len(credit_df) > 0 and date_range_days > 0:
            total_income = float(credit_df["amount"].sum())
            months = max(date_range_days / 30.0, 1.0)
            avg_monthly_income = total_income / months

        if avg_monthly_income > 0 and len(debit_df) > 0:
            max_debit = float(debit_df["amount"].max())
            depletion_ratio = max_debit / avg_monthly_income
            f_depletion = float(np.clip(depletion_ratio / 0.4, 0.0, 1.0)) if depletion_ratio > 0.4 else 0.0
        else:
            f_depletion = 0.0

        # ---------------------------------------------------------------
        # Feature 15: behavioral_fingerprint_deviation
        # ---------------------------------------------------------------
        # Composite deviation: mean of normalised z-scores across key metrics
        key_raw = [velocity, spike, top_merchant_share, float(nighttime_mask.sum() / n) if n > 0 else 0.0]
        # Compare each to "normal" baselines: [1.0, 1.5, 0.3, 0.05]
        baselines = [1.0, 1.5, 0.3, 0.05]
        deviations = []
        for val, base in zip(key_raw, baselines):
            dev = abs(val - base) / max(base, 0.01)
            deviations.append(min(dev, 3.0))
        f_fingerprint = float(np.clip(np.mean(deviations) / 3.0, 0.0, 1.0))

        features = {
            "transaction_velocity": f_velocity,
            "spending_spike_ratio": f_spike,
            "merchant_concentration_score": f_merchant_conc,
            "nighttime_transaction_ratio": f_nighttime,
            "unusual_category_score": f_unusual_cat,
            "high_freq_withdrawal_score": f_withdrawal,
            "transaction_entropy": f_entropy,
            "weekend_anomaly_score": f_weekend,
            "amount_zscore_max": f_zscore,
            "velocity_acceleration": f_accel,
            "merchant_novelty_score": f_novelty,
            "category_drift_score": f_drift,
            "round_number_ratio": f_round,
            "rapid_balance_depletion": f_depletion,
            "behavioral_fingerprint_deviation": f_fingerprint,
        }

        return FraudFeatureSet(
            features=features,
            transaction_count=n,
            date_range_days=date_range_days,
        )

    def _empty_feature_set(self) -> dict[str, float]:
        """Return zero-initialised feature dict for users with no transactions."""
        return {key: 0.0 for key in self.FEATURE_KEYS}


fraud_feature_engineer = FraudFeatureEngineer()
