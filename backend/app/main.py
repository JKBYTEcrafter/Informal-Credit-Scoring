from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import get_settings
from app.database.session import init_db
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.routes import auth, dashboard, health, transactions


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        description="Sprint 1 reliable data infrastructure API for India-focused alternative credit intelligence.",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(SecurityHeadersMiddleware)

    @app.on_event("startup")
    def on_startup() -> None:
        if settings.AUTO_CREATE_TABLES:
            init_db()

    app.include_router(health.router, prefix=settings.API_PREFIX)
    app.include_router(auth.router, prefix=settings.API_PREFIX)
    app.include_router(transactions.router, prefix=settings.API_PREFIX)
    app.include_router(dashboard.router, prefix=settings.API_PREFIX)

    @app.get("/")
    def root() -> dict[str, str]:
        return {"message": settings.APP_NAME, "docs": "/docs"}

    return app


app = create_app()
