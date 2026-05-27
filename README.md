# Alternative Credit Intelligence Platform

A production-grade, AI-powered fintech platform that converts informal transaction behavior into explainable credit intelligence, fraud risk scoring, and financial health analytics — purpose-built for underbanked and thin-file borrowers.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TailwindCSS, Recharts, Axios, React Hook Form |
| Backend | FastAPI, SQLAlchemy 2, PostgreSQL, JWT (python-jose), Bcrypt |
| Machine Learning | Scikit-learn, XGBoost, LightGBM, CatBoost, SHAP, Joblib |
| Fraud Detection | Isolation Forest, One-Class SVM, Local Outlier Factor (LOF) ensemble |
| Testing | Pytest 8, FastAPI TestClient, 82 test cases |
| Deployment | Vercel (frontend), Render (backend), Neon/Supabase (PostgreSQL) |

## Features by Sprint

### Sprint 1 — Infrastructure
- JWT authentication (register / login)
- PostgreSQL schema with SQLAlchemy ORM
- Transaction CSV upload & validation
- Dashboard summary API
- Next.js frontend with dark theme

### Sprint 2 — Credit Scoring Engine
- 25+ financial feature engineering signals
- Ensemble credit scoring (XGBoost + LightGBM + CatBoost)
- Risk classification: Low / Medium / High
- Model training pipeline with cross-validation & joblib persistence
- Model evaluation metrics API

### Sprint 3 — Explainability & Behavioral Intelligence
- SHAP explainability (waterfall + feature importance)
- 6-dimensional financial health radar
- Personalized recommendation engine
- Behavioral spender profiling
- AI financial story narrative generator
- Risk trend evolution charts

### Sprint 4 — Fraud Detection & Risk Intelligence
- 15 behavioral fraud features (velocity, spike ratio, entropy, nighttime ratio, etc.)
- Ensemble anomaly detection: Isolation Forest + One-Class SVM + LOF
- Fraud probability score (0.0–1.0) with risk tiers
- Fraud alerts, risk event pipeline, behavioral risk indicators
- Daily anomaly heatmap & transaction velocity chart
- Feature-level fraud explainability (waterfall attribution)
- Multi-page dashboard with sidebar navigation

## Project Structure

```
backend/
  app/
    routes/           # FastAPI routers (auth, transactions, credit, fraud, ...)
    models/           # SQLAlchemy ORM models
    schemas/          # Pydantic request/response schemas
    services/         # Business logic layer
    ml/
      fraud_detection/  # Fraud ML engine (feature engineer, scorer, explainer)
      feature_engineering/
      preprocessing/
      training/
      inference/
      explainability/
      evaluation/
    database/         # Engine, session, base
    middleware/       # Auth, security headers
    config/           # Settings (pydantic-settings)
    main.py
  tests/              # 82 pytest test cases
  requirements.txt

frontend/
  app/
    dashboard/        # Multi-page dashboard (credit, health, transactions, fraud, ...)
    login/ register/
  components/         # 30+ reusable React components
  services/           # Axios API service layer
  hooks/              # useAuth
  utils/types.ts      # Full TypeScript type definitions
  styles/globals.css
```

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux / macOS
pip install -r requirements.txt
copy .env.example .env        # edit DATABASE_URL and JWT_SECRET_KEY
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
copy .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Frontend: `http://localhost:3000`

### Docker (full stack)

```bash
docker compose up --build
```

### Train the credit model

```bash
cd backend
python scripts/train_credit_model.py --samples 1200
```

### Run tests

```bash
cd backend
pytest
```

## Core API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register and receive JWT |
| POST | `/api/auth/login` | Login and receive JWT |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/transactions/upload` | Upload transaction CSV |
| GET | `/api/transactions` | List user's transactions |

### Credit Intelligence
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/credit-score/{user_id}` | Alternative credit score (300–900) |
| GET | `/api/risk-analysis/{user_id}` | Risk band & key drivers |
| GET | `/api/financial-health/{user_id}` | Financial features & behavioral indicators |
| GET | `/api/explainability/{user_id}` | SHAP values & feature attribution |

### Advanced Intelligence (Sprint 3)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health-report/{user_id}` | 6-dimensional health report |
| GET | `/api/recommendations/{user_id}` | Personalized recommendations |
| GET | `/api/behavioral-analysis/{user_id}` | Spender profile & behavioral insights |
| GET | `/api/risk-trends/{user_id}` | Score evolution over time |
| GET | `/api/financial-story/{user_id}` | AI-generated narrative |
| GET | `/api/advanced-summary/{user_id}` | Full intelligence dashboard payload |

### Fraud Intelligence (Sprint 4)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/fraud-score/{user_id}` | Fraud probability score |
| GET | `/api/fraud-alerts/{user_id}` | Active fraud alerts |
| GET | `/api/risk-events/{user_id}` | Risk event pipeline |
| GET | `/api/behavioral-risk/{user_id}` | Behavioral risk indicators |
| GET | `/api/anomaly-analysis/{user_id}` | Daily anomaly heatmap data |
| GET | `/api/fraud-explainability/{user_id}` | Feature-level fraud attribution |
| GET | `/api/fraud/fraud-summary/{user_id}` | Combined fraud intelligence summary |
| POST | `/api/fraud/retrain-model` | Retrain the fraud detection model |
| GET | `/api/fraud/model-metrics` | Fraud model performance metrics |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/ml/model-metrics` | Credit model metrics |
| POST | `/api/ml/retrain-model` | Retrain credit model |

## CSV Upload Format

```csv
amount,type,merchant,category,timestamp
45000,credit,Employer,income,2026-05-01
1200,debit,Amazon,shopping,2026-05-03
800,debit,Zomato,food,2026-05-05
```

Supported `type` values: `credit`, `debit`

## Security

- Passwords hashed with Bcrypt
- All protected endpoints require `Authorization: Bearer <token>`
- CORS origins are environment-driven (`BACKEND_CORS_ORIGINS`)
- JWT checked for expiry on every page load in the frontend
- 401 responses automatically clear the session and redirect to `/login`
- Environment files (`.env`, `.env.local`) are excluded from Git

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Agile SDLC

Sprint documentation:
- [Sprint 1](docs/SPRINT_1.md) — Infrastructure & Auth
- Sprints 2–4 documented in [CHANGELOG.md](CHANGELOG.md)
