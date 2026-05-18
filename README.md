# Alternative Credit Intelligence Platform

Sprint 1 builds the reliable data infrastructure for an India-focused alternative credit platform. It includes JWT authentication, CSV transaction ingestion, PostgreSQL persistence, dashboard APIs, a protected Next.js dashboard, tests, Docker, and deployment guides.

This sprint intentionally does not implement ML credit scoring yet. The codebase is structured so later sprints can add scoring, fraud detection, streaming analytics, explainability, and graph intelligence without rewriting the foundation.

## Stack

- Frontend: Next.js, React, TailwindCSS, Axios, React Hook Form, Recharts
- Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT, Passlib/Bcrypt, Pandas, Python Multipart
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

Recommended Sprint 2 direction:

- Alembic migrations
- Transaction categorization improvements
- Feature engineering layer
- Baseline explainable credit score
- Risk event audit log
- Upload observability and ingestion status tracking
