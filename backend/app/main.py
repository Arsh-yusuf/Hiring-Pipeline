from fastapi import FastAPI
from backend.app.api.router import api_router


def create_app() -> FastAPI:
    app = FastAPI(title="Mini Hiring Pipeline API")
    app.include_router(api_router, prefix="/api")
    return app


app = create_app()