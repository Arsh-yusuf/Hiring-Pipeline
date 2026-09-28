from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.schemas.search import SearchRequest, SearchResponse
from backend.app.services.search_service import search_candidates


router = APIRouter()


@router.post("", response_model=SearchResponse)
def search(request: SearchRequest, db: Session = Depends(get_db)):
    return search_candidates(db, request.query)