from datetime import datetime
from decimal import Decimal
from io import BytesIO

import pandas as pd
from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User

REQUIRED_COLUMNS = {"amount", "type", "merchant", "category", "timestamp"}
ALLOWED_TYPES = {"credit", "debit"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_UPLOAD_ROWS = 10_000


class TransactionService:
    async def upload_csv(
        self,
        db: Session,
        current_user: User,
        file: UploadFile,
    ) -> list[Transaction]:
        if not file.filename or not file.filename.lower().endswith(".csv"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are supported",
            )

        content = await file.read()
        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded CSV file is empty",
            )
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="CSV file exceeds the 5 MB upload limit",
            )

        rows = self.parse_transaction_csv(content)
        transactions = [
            Transaction(user_id=current_user.id, **row)
            for row in rows
        ]
        db.add_all(transactions)
        db.commit()
        for transaction in transactions:
            db.refresh(transaction)
        return transactions

    def parse_transaction_csv(self, content: bytes) -> list[dict]:
        try:
            dataframe = pd.read_csv(BytesIO(content))
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to parse CSV file",
            ) from exc

        dataframe.columns = [column.strip().lower() for column in dataframe.columns]
        missing_columns = REQUIRED_COLUMNS - set(dataframe.columns)
        if missing_columns:
            raise HTTPException(
                status_code=422,
                detail=f"Missing required CSV columns: {', '.join(sorted(missing_columns))}",
            )
        if dataframe.empty:
            raise HTTPException(
                status_code=422,
                detail="CSV must contain at least one transaction row",
            )
        if len(dataframe.index) > MAX_UPLOAD_ROWS:
            raise HTTPException(
                status_code=422,
                detail=f"CSV cannot contain more than {MAX_UPLOAD_ROWS} rows",
            )

        sanitized = dataframe.copy()
        sanitized["amount"] = pd.to_numeric(sanitized["amount"], errors="coerce")
        sanitized["type"] = sanitized["type"].astype(str).str.strip().str.lower()
        sanitized["merchant"] = sanitized["merchant"].astype(str).str.strip()
        sanitized["category"] = sanitized["category"].astype(str).str.strip().str.lower()
        sanitized["timestamp"] = pd.to_datetime(sanitized["timestamp"], errors="coerce", utc=True)

        invalid_rows = sanitized[
            sanitized["amount"].isna()
            | (sanitized["amount"] <= 0)
            | ~sanitized["type"].isin(ALLOWED_TYPES)
            | (sanitized["merchant"] == "")
            | (sanitized["category"] == "")
            | sanitized["timestamp"].isna()
        ]
        if not invalid_rows.empty:
            row_numbers = [str(index + 2) for index in invalid_rows.index[:10]]
            raise HTTPException(
                status_code=422,
                detail=f"Invalid transaction data at CSV row(s): {', '.join(row_numbers)}",
            )

        if "description" not in sanitized.columns:
            sanitized["description"] = None

        transactions: list[dict] = []
        for row in sanitized.to_dict(orient="records"):
            timestamp = row["timestamp"]
            if hasattr(timestamp, "to_pydatetime"):
                timestamp = timestamp.to_pydatetime()
            transactions.append(
                {
                    "amount": Decimal(str(row["amount"])),
                    "transaction_type": row["type"],
                    "merchant": row["merchant"][:255],
                    "category": row["category"][:80],
                    "timestamp": timestamp if isinstance(timestamp, datetime) else datetime.fromisoformat(str(timestamp)),
                    "description": (
                        None
                        if pd.isna(row.get("description"))
                        else str(row.get("description")).strip()[:500]
                    ),
                }
            )
        return transactions

    def list_user_transactions(self, db: Session, current_user: User) -> list[Transaction]:
        statement = (
            select(Transaction)
            .where(Transaction.user_id == current_user.id)
            .order_by(Transaction.timestamp.desc(), Transaction.id.desc())
        )
        return list(db.scalars(statement).all())


transaction_service = TransactionService()
