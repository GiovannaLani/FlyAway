import requests
from app.db.mongo import db

def select_place_by_external_id(name: str, lat: str, lon: str, external_id: str):
    existing = db.places.find_one({"external_id": external_id})
    if existing:
        return {"_id": str(existing["_id"])}

    result = db.places.insert_one({
        "name": name,
        "lat": lat,
        "lon": lon,
        "external_id": external_id
    })
    return {"_id": str(result.inserted_id)}

def search_place(query: str):
    if not query:
        return []

    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": query, "format": "json", "limit": 5}
    headers = {"User-Agent": "FlyAwayApp/1.0"}

    resp = requests.get(url, params=params, headers=headers)
    if resp.status_code != 200:
        print(f"Error fetching data: {resp.status_code}")
        return []

    try:
        data = resp.json()
    except ValueError:
        print("Response is not valid JSON:", resp.text)
        return []

    results = []
    for place in data:
        results.append({
            "name": place.get("display_name"),
            "lat": place.get("lat"),
            "lon": place.get("lon"),
            "id": place.get("osm_id")
        })

    return results
