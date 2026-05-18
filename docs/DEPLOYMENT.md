# Deployment Guide

## Local Docker

Run the full stack:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

## Backend on Render

1. Create a new Render Web Service.
2. Connect the repository.
3. Use Docker runtime with `backend` as the root directory.
4. Set environment variables:

```text
ENVIRONMENT=production
API_PREFIX=/api
DATABASE_URL=<Neon or Supabase PostgreSQL connection string>
JWT_SECRET_KEY=<long random secret>
BACKEND_CORS_ORIGINS=https://<your-vercel-domain>
AUTO_CREATE_TABLES=True
```

5. Deploy.

Production note: `AUTO_CREATE_TABLES=True` is acceptable for this Sprint 1 MVP, but Alembic migrations should replace it before regulated production use.

## Frontend on Vercel

1. Import the `frontend` directory as a Vercel project.
2. Set the framework preset to Next.js.
3. Set environment variable:

```text
NEXT_PUBLIC_API_URL=https://<your-render-api-domain>/api
```

4. Deploy.

## Database on Neon or Supabase

1. Create a PostgreSQL database.
2. Copy the pooled or direct connection string.
3. Use the connection string as `DATABASE_URL` in Render.
4. Confirm SSL requirements from the provider. If required, append provider-specific query parameters to the SQLAlchemy URL.

## Production Hardening Backlog

- Add Alembic migrations.
- Add refresh tokens and token revocation.
- Add structured logging and request IDs.
- Add rate limiting for auth and upload endpoints.
- Add audit trails for CSV ingestion.
- Add object storage for original uploads if compliance requires retention.
