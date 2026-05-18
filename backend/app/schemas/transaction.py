from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TransactionCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    transaction_type: Literal["credit", "debit"]
    merchant: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=80)
    timestamp: datetime
    description: str | None = None

    @field_validator("merchant", "category", "description")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class TransactionPublic(BaseModel):
    id: int
    amount: Decimal
    transaction_type: Literal["credit", "debit"]
    merchant: str
    category: str
    timestamp: datetime
    description: str | None = None

    model_config = ConfigDict(from_attributes=True)


class TransactionUploadResponse(BaseModel):
    imported_count: int
    transactions: list[TransactionPublic]
