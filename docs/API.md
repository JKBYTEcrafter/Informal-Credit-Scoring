# API Documentation

Base URL:

- Local: `http://localhost:8000/api`
- Production: Render backend URL plus `/api`

Interactive docs:

- Swagger UI: `/docs`
- ReDoc: `/redoc`
- OpenAPI JSON: `/openapi.json`

## Authentication

### Register

`POST /api/auth/register`

Request:

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "StrongPass123",
  "occupation": "Retail owner",
  "monthly_income": 45000
}
```

Response:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Aarav Sharma",
    "email": "aarav@example.com",
    "occupation": "Retail owner",
    "monthly_income": "45000.00",
    "created_at": "2026-05-18T14:00:00Z"
  }
}
```

### Login

`POST /api/auth/login`

Request:

```json
{
  "email": "aarav@example.com",
  "password": "StrongPass123"
}
```

Response: same as register.

## Transactions

All transaction endpoints require:

`Authorization: Bearer <access_token>`

### Upload CSV

`POST /api/transactions/upload`

Form field:

- `file`: CSV file

Required CSV format:

```csv
amount,type,merchant,category,timestamp
1200,credit,Salary,income,2026-05-18
300,debit,Amazon,shopping,2026-05-18
```

Response:

```json
{
  "imported_count": 2,
  "transactions": [
    {
      "id": 1,
      "amount": "1200.00",
      "transaction_type": "credit",
      "merchant": "Salary",
      "category": "income",
      "timestamp": "2026-05-18T00:00:00Z",
      "description": null
    }
  ]
}
```

### List Transactions

`GET /api/transactions`

Response:

```json
[
  {
    "id": 1,
    "amount": "1200.00",
    "transaction_type": "credit",
    "merchant": "Salary",
    "category": "income",
    "timestamp": "2026-05-18T00:00:00Z",
    "description": null
  }
]
```

## Dashboard

### Summary

`GET /api/dashboard/summary`

Response:

```json
{
  "total_income": 45000,
  "total_expenses": 27000,
  "savings_ratio": 0.4,
  "transaction_count": 152
}
```

## Credit Intelligence

All endpoints require:

`Authorization: Bearer <access_token>`

Users can only access their own score and financial intelligence data.

### Credit Score

`GET /api/credit-score/{user_id}`

Response:

```json
{
  "user_id": 1,
  "score": 742.35,
  "risk_level": "Medium Risk",
  "model_version": "sprint2-credit-score-v1-20260519",
  "model_name": "Random Forest",
  "generated_at": "2026-05-19T10:00:00Z",
  "score_breakdown": {
    "ml_prediction": 735.2,
    "behavioral_score": 752.1,
    "financial_health_score": 746.4
  },
  "explanations": [
    {
      "feature": "savings_ratio",
      "impact": "positive",
      "message": "Savings ratio improved your score."
    }
  ],
  "feature_importance": [
    {
      "feature": "financial discipline score",
      "importance": 0.18,
      "method": "rules"
    }
  ]
}
```

Risk bands:

- `750-900`: Low Risk
- `600-749`: Medium Risk
- `300-599`: High Risk

### Risk Analysis

`GET /api/risk-analysis/{user_id}`

Response:

```json
{
  "user_id": 1,
  "score": 742.35,
  "risk_level": "Medium Risk",
  "band": "600-749",
  "key_risk_factors": [],
  "protective_factors": [
    {
      "feature": "recurring_income_confidence",
      "impact": "positive",
      "message": "Stable recurring income positively affected your rating."
    }
  ],
  "generated_at": "2026-05-19T10:00:00Z"
}
```

### Financial Health

`GET /api/financial-health/{user_id}`

Response:

```json
{
  "user_id": 1,
  "health_score": 73,
  "features": {
    "average_monthly_income": 55000,
    "average_monthly_spending": 22000,
    "savings_ratio": 0.6,
    "spending_to_income_ratio": 0.4
  },
  "behavioral_indicators": {
    "financial_discipline_score": 0.81,
    "impulsive_spending_score": 0.08,
    "transaction_regularity_score": 0.67,
    "recurring_income_confidence": 0.88
  },
  "category_distribution": [
    {
      "category": "food",
      "total_spent": 7800,
      "ratio": 0.35
    }
  ],
  "monthly_cash_flow": [
    {
      "month": "2026-05",
      "income": 55000,
      "expenses": 22000,
      "net_cash_flow": 33000
    }
  ],
  "categorical_profile": {
    "dominant_category": "food",
    "cash_flow_pattern": "surplus"
  },
  "generated_at": "2026-05-19T10:00:00Z"
}
```

## ML Operations

ML endpoints are JWT-protected. Sprint 2 keeps them available to authenticated users; production deployments should restrict them to admin roles.

### Retrain Model

`POST /api/ml/retrain-model`

Request:

```json
{
  "n_samples": 1200,
  "include_optional_models": true,
  "tune_hyperparameters": false
}
```

Response includes:

- Selected model name and version
- Accuracy, precision, recall, F1 score, ROC-AUC
- Confusion matrix
- Cross-validation mean absolute error
- Model comparison report
- Feature schema and training metadata

### Model Metrics

`GET /api/ml/model-metrics`

Returns the latest persisted model metadata. If no model has been trained yet, the endpoint returns the heuristic baseline metadata and feature schema.

## Health

`GET /api/health`

Response:

```json
{
  "status": "ok",
  "service": "alternative-credit-api"
}
```
