# Sprint 2: Credit Scoring & Financial Intelligence Engine

## 1. Requirements Gathering

Goal: transform the platform from a financial tracker into an AI-driven alternative credit intelligence system.

Core user stories:

- As an authenticated user, I can generate an alternative credit score from my transaction behavior.
- As an authenticated user, I can understand my risk level and the reasons behind it.
- As an authenticated user, I can view financial health metrics, behavioral indicators, trends, and category analytics.
- As an engineer, I can train, evaluate, persist, and inspect the scoring model.
- As an ML engineer, I can extend feature engineering, preprocessing, explainability, and model candidates without rewriting API services.

Risk dimensions:

- Income consistency
- Spending behavior
- Savings discipline
- Transaction regularity
- Cash-flow stability
- Financial volatility

Risk bands:

- `750-900`: Low Risk
- `600-749`: Medium Risk
- `300-599`: High Risk

## 2. Planning

Sprint deliverables:

- Financial feature engineering pipeline.
- Preprocessing pipeline with missing value handling, outlier clipping, scaling, normalization, and categorical encoding.
- Synthetic target generation for `300-900` credit scores.
- Multi-model training pipeline with Random Forest and optional XGBoost, LightGBM, and CatBoost candidates.
- Evaluation reports with accuracy, precision, recall, F1, ROC-AUC, confusion matrix, cross-validation MAE, and model comparison.
- Joblib model persistence with model version, feature schema, and training metadata.
- Scoring service that combines ML prediction, behavioral metrics, and financial health indicators.
- SHAP-ready explainability layer with deterministic fallback explanations.
- Protected credit score, risk analysis, financial health, retraining, and metrics APIs.
- Advanced dashboard panels for score, gauge, health, trends, categories, feature importance, explanations, and MLOps metrics.

## 3. System Design

High-level flow:

```text
Transactions
  -> Feature Engineering
  -> Preprocessing
  -> ML Model
  -> Credit Score
  -> Risk Classification
  -> Explainability
  -> Dashboard Visualization
```

Backend boundaries:

- `app/ml/feature_engineering`: transaction-to-feature transformation.
- `app/ml/preprocessing`: cleaning, outlier handling, scaling, normalization, and encoding.
- `app/ml/training`: synthetic dataset generation, model training, comparison, and persistence.
- `app/ml/inference`: scoring orchestration and risk classification.
- `app/ml/explainability`: SHAP integration and fallback local explanations.
- `app/ml/evaluation`: classification metrics and confusion matrix generation.
- `app/services`: application orchestration, authorization, persistence, and API response assembly.
- `app/routes`: protected REST contracts.

Database additions:

- `credit_scores`: persisted score snapshots with user, score, risk level, model version, and generation time.
- `financial_features`: persisted feature snapshots with user, feature name, value, and generation time.

## 4. Implementation

Implemented endpoints:

- `GET /api/credit-score/{user_id}`
- `GET /api/risk-analysis/{user_id}`
- `GET /api/financial-health/{user_id}`
- `POST /api/ml/retrain-model`
- `GET /api/ml/model-metrics`

Implemented feature groups:

- Income and expense aggregates.
- Savings and spending ratios.
- Stability, variance, volatility, and growth features.
- Merchant diversity and category distribution.
- Weekend and high-risk spending behavior.
- Financial discipline, impulsive spending, transaction regularity, and recurring income confidence.

Security:

- All Sprint 2 APIs require JWT authentication.
- User-specific financial intelligence APIs enforce self-access only.
- ML operations are protected and prepared for future role-based access controls.

## 5. Testing

Implemented Pytest coverage:

- Required feature schema generation.
- Empty transaction history safety.
- Preprocessing for missing values, outliers, and categorical data.
- Deterministic scoring consistency.
- Risk band thresholds.
- Credit score API response shape and persistence path.
- Cross-user authorization protection.
- Financial health dashboard data integrity.
- ML metrics endpoint protection.

Run:

```bash
cd backend
pytest
```

## 6. Deployment

Backend environment additions:

```text
ML_MODEL_DIR=app/ml/artifacts
ML_MODEL_VERSION=sprint2-credit-score-v1
ML_SYNTHETIC_TRAINING_ROWS=1200
ML_RANDOM_SEED=42
```

Training options:

```bash
cd backend
python scripts/train_credit_model.py --samples 1200
python scripts/train_credit_model.py --skip-optional-models
```

Production considerations:

- Store model artifacts in durable storage or a model registry.
- Promote model versions explicitly across environments.
- Add score drift and feature drift monitoring.
- Restrict retraining to admin/service identities.
- Replace table auto-creation with Alembic migrations.

## 7. Feedback & Retrospective

Sprint 2 establishes the scoring and intelligence layer while keeping model dependencies loosely coupled. The platform can now support future modules without changing the transaction ingestion foundation.

Recommended Sprint 3 direction:

- Fraud and anomaly detection.
- Model registry integration.
- Score drift monitoring.
- Real-time streaming features.
- Recommendation engine for financial improvement.
- Admin roles and audit logging.
- Graph intelligence for relationship-aware risk signals.
