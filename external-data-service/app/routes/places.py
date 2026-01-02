from fastapi import APIRouter
from app.services.places_service import search_place, select_place_by_external_id
from pydantic import BaseModel
from app.db.mongo import db
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/external/places", tags=["Places"])

class PlaceSelectDto(BaseModel):
    name: str
    lat: str
    lon: str
    external_id: str

@router.post("/select")
def select_place(dto: PlaceSelectDto):
    return select_place_by_external_id(dto.name, dto.lat, dto.lon, dto.external_id)

@router.get("/search")
def search(q: str):
    result = search_place(q)
    if not result:
        return {"error": "Place not found"}
    return result