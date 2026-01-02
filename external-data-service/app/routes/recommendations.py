from fastapi import APIRouter
from app.services.recommendations_service import get_place_recommendations

router = APIRouter(prefix="/api/external/recommendations", tags=["Recommendations"])

@router.get("/{place_id}")
def recommendations(place_id: str):
    return get_place_recommendations(place_id)