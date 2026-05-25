from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal

import numpy as np
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.sprint4 import AnomalyAnalysisResponse, AnomalyDataPoint


class AnomalyAnalysisService:
    """
    Produces per-day anomaly analysis from transaction history.
    Aggregates transactions by date and computes an anomaly score for each day
    using amount z-scores, velocity deviation, and round-number prevalence.
    Used to render anomaly heatmaps on the frontend.
    """

    ANOMALY_THRESHOLD = 0.55

    def get_anomaly_analysis(
        self,
        db: Session,
        current_user: User,
        user_id: int,
    ) -> AnomalyAnalysisResponse:
        self._authorize(current_user, user_id)

        transactions = self._get_transactions(db, user_id)
        generated_at = datetime.now(timezone.utc)

        if not transactions:
            return AnomalyAnalysisResponse(
                user_id=user_id,
                anomaly_points=[],
                overall_anomaly_score=0.0,
                anomalous_day_count=0,
                peak_anomaly_date=None,
                generated_at=generated_at,
            )

        # Build per-day records
        daily: dict[str, dict] = {}
        all_amounts: list[float] = []

        for txn in transactions:
            ts = txn.timestamp
            date_str = ts.date().isoformat()
            amount = float(txn.amount) if txn.amount is not None else 0.0
            all_amounts.append(amount)

            if date_str not in daily:
                daily[date_str] = {
                    "total_amount": 0.0,
                    "transaction_count": 0,
                    "amounts": [],
                }
            daily[date_str]["total_amount"] += amount
            daily[date_str]["transaction_count"] += 1
            daily[date_str]["amounts"].append(amount)

        # Global amount statistics
        amounts_arr = np.array(all_amounts, dtype=np.float64)
        global_mean = float(amounts_arr.mean())
        global_std = float(amounts_arr.std()) if len(amounts_arr) > 1 else 1.0
        global_std = max(global_std, 1.0)

        # Overall velocity (avg transactions per day)
        avg_velocity = len(transactions) / max(len(daily), 1)

        anomaly_points: list[AnomalyDataPoint] = []
        for date_str in sorted(daily.keys()):
            day_data = daily[date_str]
            day_amounts = np.array(day_data["amounts"], dtype=np.float64)
            day_count = day_data["transaction_count"]
            day_total = day_data["total_amount"]

            # --- Component 1: Amount z-score (max within day)
            if global_std > 0 and len(day_amounts) > 0:
                zscores = np.abs((day_amounts - global_mean) / global_std)
                max_z = float(min(zscores.max(), 5.0))
                amount_anomaly = max_z / 5.0
            else:
                amount_anomaly = 0.0

            # --- Component 2: Velocity anomaly
            velocity_ratio = day_count / max(avg_velocity, 1.0)
            velocity_anomaly = float(np.clip((velocity_ratio - 1.0) / 3.0, 0.0, 1.0))

            # --- Component 3: Round-number prevalence
            round_count = sum(1 for a in day_data["amounts"] if a % 100 == 0 or a % 1000 == 0)
            round_anomaly = float(round_count / day_count) if day_count > 0 else 0.0

            # Weighted composite
            anomaly_score = float(
                0.50 * amount_anomaly
                + 0.35 * velocity_anomaly
                + 0.15 * round_anomaly
            )
            anomaly_score = float(np.clip(anomaly_score, 0.0, 1.0))

            anomaly_points.append(
                AnomalyDataPoint(
                    date=date_str,
                    anomaly_score=round(anomaly_score, 4),
                    transaction_count=day_count,
                    total_amount=round(day_total, 2),
                    is_anomalous=anomaly_score > self.ANOMALY_THRESHOLD,
                )
            )

        # Aggregate metrics
        scores = [p.anomaly_score for p in anomaly_points]
        overall_score = float(np.mean(scores)) if scores else 0.0
        anomalous_days = [p for p in anomaly_points if p.is_anomalous]
        peak_point = max(anomaly_points, key=lambda p: p.anomaly_score) if anomaly_points else None

        return AnomalyAnalysisResponse(
            user_id=user_id,
            anomaly_points=anomaly_points,
            overall_anomaly_score=round(overall_score, 4),
            anomalous_day_count=len(anomalous_days),
            peak_anomaly_date=peak_point.date if peak_point and peak_point.is_anomalous else None,
            generated_at=generated_at,
        )

    def _get_transactions(self, db: Session, user_id: int) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.timestamp.asc())
        )
        return list(db.scalars(stmt).all())

    def _authorize(self, current_user: User, user_id: int) -> None:
        if current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users can only access their own anomaly data",
            )


anomaly_analysis_service = AnomalyAnalysisService()
