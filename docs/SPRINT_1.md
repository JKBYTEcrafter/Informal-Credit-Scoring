# Sprint 1: Reliable Data Infrastructure

## 1. Requirements Gathering

Goal: build the foundation for an India-focused alternative credit platform without introducing credit-scoring ML yet.

Core user stories:

- As a user, I can register and log in securely.
- As an authenticated user, I can upload bank or transaction CSV data.
- As an authenticated user, I can view my stored transactions.
- As an authenticated user, I can view income, expense, savings, and transaction-count metrics.
- As an engineer, I can run tests and deploy the frontend, backend, and database independently.

Out of scope for Sprint 1:

- ML credit scoring
- Fraud models
- Streaming analytics
- Graph intelligence
- Bureau integrations

## 2. Planning

Sprint deliverables:

- FastAPI backend with modular route, service, model, schema, middleware, database, and config layers.
- Next.js frontend with authentication pages, protected dashboard, CSV upload, and charts.
- PostgreSQL-ready persistence through SQLAlchemy ORM.
- Test suite using Pytest and FastAPI TestClient.
- Docker, Render, Vercel, and Neon/Supabase readiness.

## 3. System Design

Architecture style: modular monolith, service-oriented boundaries, future microservice extraction.

Backend layers:

- Routes: HTTP contract and dependency injection.
- Services: business rules, CSV validation, dashboard calculations.
- Schemas: request and response validation.
- Models: SQLAlchemy ORM entities.
- Database: engine, session, and metadata.
- Middleware: JWT dependencies and security headers.
- Config: environment-driven settings.

Frontend layers:

- App routes: login, registration, dashboard.
- Components: reusable UI and workflow pieces.
- Services: Axios API clients.
- Hooks: authentication context access.
- Utils: types and formatting helpers.

## 4. Implementation

Completed in Sprint 1:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/transactions/upload`
- `GET /api/transactions`
- `GET /api/dashboard/summary`
- JWT authentication and protected API routes.
- Password hashing with Passlib/Bcrypt.
- Pandas CSV parsing and validation.
- SQLAlchemy user and transaction models.
- Responsive Next.js dashboard.

## 5. Testing

Implemented coverage:

- Authentication registration, duplicate registration, login, and protected route access.
- CSV upload persistence.
- Transaction fetch behavior.
- Dashboard financial metric calculations.
- CSV validation edge cases.
- User-to-transaction database relationship.

Run backend tests:

```bash
cd backend
pytest
```

## 6. Deployment

Targets:

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL or Supabase PostgreSQL

Deployment artifacts:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `render.yaml`
- `frontend/vercel.json`
- `docs/DEPLOYMENT.md`

## 7. Feedback & Retrospective

Sprint 1 establishes reliable ingestion and storage. The next sprint should add migration tooling, richer transaction normalization, bureau-style risk features, and the first interpretable scoring baseline.

Risks to revisit:

- Replace `AUTO_CREATE_TABLES` with Alembic migrations before serious production use.
- Add refresh tokens or server-side session revocation for stricter auth control.
- Add file-level antivirus and object storage for larger uploads.
- Add audit logs for fintech compliance.
