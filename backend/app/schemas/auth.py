from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserPublic


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    occupation: str | None = Field(default=None, max_length=120)
    monthly_income: Decimal = Field(default=Decimal("0.00"), ge=0)

    @field_validator("name", "occupation")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
