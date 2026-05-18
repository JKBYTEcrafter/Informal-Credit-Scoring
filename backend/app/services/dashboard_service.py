from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User


class DashboardService:
    def get_summary(self, db: Session, current_user: User) -> dict:
        income = self._sum_by_type(db, current_user.id, "credit")
        expenses = self._sum_by_type(db, current_user.id, "debit")
        transaction_count = db.scalar(
            select(func.count(Transaction.id)).where(Transaction.user_id == current_user.id)
        ) or 0

        savings_ratio = float((income - expenses) / income) if income > 0 else 0.0

        return {
            "total_income": float(income),
            "total_expenses": float(expenses),
            "savings_ratio": round(savings_ratio, 4),
            "transaction_count": int(transaction_count),
        }

    def _sum_by_type(self, db: Session, user_id: int, transaction_type: str) -> Decimal:
        total = db.scalar(
            select(func.coalesce(func.sum(Transaction.amount), 0)).where(
                Transaction.user_id == user_id,
                Transaction.transaction_type == transaction_type,
            )
        )
        return Decimal(str(total or 0))


dashboard_service = DashboardService()
