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

## Health

`GET /api/health`

Response:

```json
{
  "status": "ok",
  "service": "alternative-credit-api"
}
```
