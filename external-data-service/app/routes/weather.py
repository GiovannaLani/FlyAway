from fastapi import APIRouter, HTTPException, Query
from app.services.weather_service import get_weather_by_place_and_date

router = APIRouter(prefix="/api/external/weather", tags=["Weather"])

@router.get("/{place_id}")
def get_weather( place_id: str, date: str = Query(..., examples="2024-12-02")):
    weather = get_weather_by_place_and_date(place_id, date)
    if not weather:
        raise HTTPException(status_code=404, detail="Weather not available")
    return weather