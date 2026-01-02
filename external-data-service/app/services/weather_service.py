import requests
from app.db.mongo import db
from datetime import datetime, timedelta
from bson import ObjectId

CACHE_HOURS = 6

def get_weather_by_place_and_date(place_id: str, date: str):

    try:
        mongo_id = ObjectId(place_id)
    except Exception:
        return None

    place = db.places.find_one({"_id": mongo_id})
    if not place:
        return None

    lat = place["lat"]
    lon = place["lon"]

    cached = db.weather.find_one({
        "place_id": place_id,
        "date": date,
        "expires_at": {"$gt": datetime.utcnow()}
    })

    if cached:
        return cached["data"]

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "temperature_2m_max,temperature_2m_min,weathercode",
        "timezone": "auto"
    }
    res = requests.get(url, params=params)
    if res.status_code != 200:
        return None

    daily = res.json()["daily"]
    if date not in daily["time"]:
        return {
            "available": False,
            "date": date,
            "reason": "Forecast not available for this date"
        }

    idx = daily["time"].index(date)

    weather_data = {
        "available": True,
        "date": date,
        "temp_min": daily["temperature_2m_min"][idx],
        "temp_max": daily["temperature_2m_max"][idx],
        "weathercode": daily["weathercode"][idx]
    }

    db.weather.insert_one({
        "place_id": place_id,
        "date": date,
        "data": weather_data,
        "expires_at": datetime.utcnow() + timedelta(hours=CACHE_HOURS)
    })

    return weather_data