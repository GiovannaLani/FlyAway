import requests
from datetime import date
from app.db.mongo import db

API_URL = "https://api.frankfurter.app/latest"

def convert_currency(from_currency: str, to_currency: str, amount: float):
    today = date.today().isoformat()

    params = {
        "amount": amount,
        "from": from_currency,
        "to": to_currency
    }

    resp = requests.get(API_URL, params=params)
    if resp.status_code != 200:
        return None

    data = resp.json()

    if "rates" not in data or to_currency not in data["rates"]:
        return None

    result = {
        "from": from_currency,
        "to": to_currency,
        "amount": amount,
        "converted": data["rates"][to_currency],
        "rate": data["rates"][to_currency] / amount,
        "date": today
    }

    return result
