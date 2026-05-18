from pydantic import BaseModel, Field


class DashboardSummary(BaseModel):
    total_income: float = Field(ge=0)
    total_expenses: float = Field(ge=0)
    savings_ratio: float
    transaction_count: int = Field(ge=0)
