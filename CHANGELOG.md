# Changelog

All notable changes to the **Alternative Credit Intelligence Platform** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0] — 2026-05-25 — Sprint 4: Fraud Detection & Financial Risk Intelligence

### Added
- **Fraud Detection Engine** — Ensemble ML model: Isolation Forest + One-Class SVM + Local Outlier Factor (LOF)
- **15 Behavioral Fraud Features**: transaction velocity, spending spike ratio, merchant concentration, nighttime transaction ratio, behavioral entropy, category drift, round-number ratio, and more
- **Fraud Scoring** — 0.0–1.0 fraud probability with four risk tiers (Low / Medium / High / Critical)
- **Fraud Explainability** — Feature-level attribution waterfall chart showing how each feature contributes to the final fraud score
- **Fraud Alerts** — Alert feed with severity tiers (Critical, High, Medium, Low) and acknowledgement flow
- **Risk Event Pipeline** — Timeline of risk events as they enter the detection pipeline
- **Anomaly Heatmap** — GitHub-style calendar heatmap of daily anomaly scores
- **Transaction Velocity Chart** — Area chart with anomaly markers for daily transaction volume
- **Behavioral Risk Panel** — Grid of 8 risk indicators with animated progress bars
- **Multi-Page Dashboard** — Sidebar navigation architecture replacing the single-page layout
  - `/dashboard` — Overview with KPI cards and module navigation
  - `/dashboard/credit` — Credit Intelligence
  - `/dashboard/health` — Financial Health
  - `/dashboard/transactions` — Data ingestion & ledger
  - `/dashboard/insights` — AI Insights & behavioral profiling
  - `/dashboard/analytics` — ML Analytics & model metrics
  - `/dashboard/fraud` — Fraud Intelligence Engine (new)
  - `/dashboard/profile` — Profile & Settings (new)
- **Profile & Settings Page** — View account info, platform version, and confirmed sign-out
- **Error Boundary** — React class error boundary with a premium fallback UI
- **Top Loading Bar** — NProgress-style route-change loading indicator
- **JWT Expiry Check** — Token expiry decoded on mount; stale sessions auto-cleared
- **401 Response Interceptor** — Axios interceptor that redirects to `/login` on unauthorized responses
- **FraudModelMetricsResponse** TypeScript type for the model-metrics endpoint
- **4 New DB Models**: `FraudScore`, `FraudAlert`, `RiskEvent`, `BehavioralRiskProfile`
- **9 new fraud API endpoints** under `/api/fraud-*` and `/api/fraud/`
- **Named Docker volumes** for fraud and credit model artifact persistence across container restarts
- **pytest.ini filterwarnings** to suppress ML library deprecation noise

### Changed
- `docker-compose.yml`: added `fraud_model_artifacts` and `ml_model_artifacts` named volumes
- `README.md`: updated to cover all 4 sprints with full API reference table
- `app/main.py`: version bumped to `0.4.0`
- `AppShell.tsx`: added Settings nav item, clickable avatar linking to profile page, 2-letter initials, gradient avatar styling

---

## [0.3.0] — 2026-05-23 — Sprint 3: Explainability & Behavioral Intelligence

### Added
- **SHAP Explainability** — Local SHAP values for every credit score, waterfall chart visualization
- **6-Dimensional Financial Health Radar** — Stability, volatility, cash-flow health, savings discipline, expense management, income reliability
- **Recommendation Engine** — Personalized financial improvement recommendations with priority tiers
- **Behavioral Spender Profiling** — ML-powered spender archetype classification
- **AI Financial Story Generator** — Narrative-style financial health summary
- **Risk Trend Evolution** — Month-over-month credit score and health score trend tracking
- **Advanced Summary Banner** — Combined intelligence payload for the dashboard overview
- **5 new Sprint 3 route groups** under `/api/`

---

## [0.2.0] — 2026-05-19 — Sprint 2: ML Credit Scoring Engine

### Added
- **Feature Engineering** — 25+ signals: savings ratio, spending volatility, merchant diversity, income stability, weekend spending frequency, and more
- **Ensemble Credit Scoring** — XGBoost, LightGBM, CatBoost stacked model pipeline
- **Model Training Script** — `scripts/train_credit_model.py` with hyperparameter tuning and cross-validation
- **Model Evaluation API** — ROC-AUC, precision, recall, F1, confusion matrix
- **Risk Classification** — Low / Medium / High risk bands (300–900 score range)
- **Joblib Model Persistence** — Trained models saved to `app/ml/artifacts/`
- **Financial Health API** — Category distribution, monthly cash flow, behavioral indicators

---

## [0.1.0] — 2026-05-18 — Sprint 1: Infrastructure & Auth

### Added
- **JWT Authentication** — Register, login, protected routes via Bearer token
- **PostgreSQL Integration** — SQLAlchemy 2 ORM, auto table creation, psycopg3 driver
- **Transaction Upload** — CSV parsing, validation, and persistence
- **Dashboard Summary API** — Income, expenses, savings ratio, transaction count
- **Frontend Scaffold** — Next.js 14, TailwindCSS, dark theme, Recharts
- **Docker Compose** — PostgreSQL + FastAPI + Next.js full-stack compose file
- **Vercel + Render** deployment configuration
- **Pytest** test suite foundation
