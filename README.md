# Alternative Credit Intelligence Platform

Sprint 1 built the reliable data infrastructure for an India-focused alternative credit platform. Sprint 2 adds a financial intelligence and credit scoring engine that turns transaction behavior into explainable alternative credit risk signals.

The platform now supports feature engineering, scoring, risk classification, model training, explainability, evaluation metrics, and advanced dashboard analytics while preserving a modular architecture for future fraud detection, streaming analytics, recommendations, and graph intelligence.

## Stack

- Frontend: Next.js, React, TailwindCSS, Axios, React Hook Form, Recharts
- Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT, Bcrypt, Pandas, NumPy, Python Multipart
- Machine Learning: Scikit-learn, XGBoost, LightGBM, CatBoost, SHAP, Joblib
- Testing: Pytest, FastAPI TestClient, Postman collection
- Deployment: Vercel, Render, Neon or Supabase PostgreSQL

## Project Structure

```text
backend/
  app/
    routes/
    models/
    schemas/
    services/
    ml/
      feature_engineering/
      preprocessing/
      training/
      inference/
      explainability/
      evaluation/
      models/
    analytics/
    database/
    middleware/
    utils/
    config/
    main.py
  tests/
  requirements.txt

frontend/
  app/
  components/
  services/
  hooks/
  utils/
  styles/
  public/
```

## Local Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

API docs:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Local Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend:

- `http://localhost:3000`

## Run With Docker

```bash
docker compose up --build
```

## Backend Tests

```bash
cd backend
pytest
```

## Core API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register user and return JWT |
| POST | `/api/auth/login` | Authenticate user and return JWT |
| POST | `/api/transactions/upload` | Upload transaction CSV |
| GET | `/api/transactions` | Fetch authenticated user's transactions |
| GET | `/api/dashboard/summary` | Fetch dashboard metrics |
| GET | `/api/credit-score/{user_id}` | Generate and persist alternative credit score |
| GET | `/api/risk-analysis/{user_id}` | Fetch risk band and explanatory risk drivers |
| GET | `/api/financial-health/{user_id}` | Fetch financial features, trends, categories, and behavioral indicators |
| POST | `/api/ml/retrain-model` | Train and persist the scoring model |
| GET | `/api/ml/model-metrics` | Fetch model evaluation metrics and training metadata |
| GET | `/api/health` | Health check |

## CSV Format

```csv
amount,type,merchant,category,timestamp
1200,credit,Salary,income,2026-05-18
300,debit,Amazon,shopping,2026-05-18
```

## Dashboard Metrics

- Total income: sum of `credit` transactions
- Total expenses: sum of `debit` transactions
- Savings ratio: `(income - expenses) / income`
- Transaction count: number of stored transactions
- Alternative credit score: 300 to 900
- Risk level: Low Risk, Medium Risk, or High Risk
- Behavioral indicators: financial discipline, impulsive spending, transaction regularity, recurring income confidence
- Explainability: local explanations and feature importance
- Financial health analytics: income trends, spending trends, monthly cash flow, and category distribution

## Sprint 2 ML Engine

Feature engineering generates the following production-oriented signals:

- Average monthly income and spending
- Savings and spending-to-income ratios
- Transaction frequency and regularity
- Income stability and variance
- Spending volatility and expense variance
- Merchant diversity and category distribution
- Cash-flow consistency and monthly growth trend
- Weekend and high-risk spending frequency
- Financial discipline, impulsive spending, and recurring income confidence

The model pipeline includes data cleaning, missing value handling, outlier clipping, standard scaling, min-max normalization, categorical encoding, train/validation split, cross-validation, optional hyperparameter tuning, model comparison, evaluation metrics, and joblib persistence.

Train from the backend directory:

```bash
python scripts/train_credit_model.py --samples 1200
```

Train only the lightweight baseline:

```bash
python scripts/train_credit_model.py --skip-optional-models
```

## Agile SDLC

Sprint 1 artifacts are documented in [docs/SPRINT_1.md](docs/SPRINT_1.md).

Phases covered:

- Requirements Gathering
- Planning
- System Design
- Implementation
- Testing
- Deployment
- Feedback & Retrospective

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## API Documentation

See [docs/API.md](docs/API.md), or run the backend and open `/docs`.

## Security Notes

- Passwords are hashed with Bcrypt through Passlib.
- Protected APIs require a JWT bearer token.
- CORS origins are environment-driven.
- Environment files are ignored by Git.
- Production secrets must be set through Render and Vercel environment settings.

## Future Sprint Expansion

Recommended Sprint 3 direction:

- Alembic migrations
- Role-based ML operations controls
- Transaction categorization improvements
- Fraud detection and anomaly scoring
- Streaming inference pipeline
- Risk event audit log
- Upload observability and ingestion status tracking
