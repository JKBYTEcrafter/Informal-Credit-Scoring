from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    occupation: str | None = None
    monthly_income: Decimal = Field(default=Decimal("0.00"))
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
