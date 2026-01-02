from fastapi import APIRouter, Query
from app.services.currency_service import convert_currency

router = APIRouter(  prefix="/api/external/currency", tags=["Currency"])

@router.get("/convert")
def convert( from_currency: str = Query(..., alias="from"), to_currency: str = Query(..., alias="to"), amount: float = 1.0):
    result = convert_currency(from_currency.upper(), to_currency.upper(), amount)
    if not result:
        return {"error": "Conversion failed"}
    return result
