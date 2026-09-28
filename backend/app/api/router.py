from fastapi import APIRouter
from backend.app.api.routes import candidates, search

api_router = APIRouter()
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(search.router, prefix="/search", tags=["search"])