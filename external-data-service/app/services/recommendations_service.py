import requests
from datetime import datetime, timedelta
from app.db.mongo import db
from bson import ObjectId

OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.nchc.org.tw/api/interpreter",
]

HEADERS = {
    "User-Agent": "MyTourismApp/1.0 (contact: dev@mitapp.com)"
}

DEFAULT_RADIUS = 50000
OVERPASS_TIMEOUT = 25
CACHE_HOURS = 24

def overpass_request(query: str):
    for url in OVERPASS_URLS:
        try:
            res = requests.post(
                url,
                data={"data": query},
                headers=HEADERS,
                timeout=OVERPASS_TIMEOUT
            )
            res.raise_for_status()
            return res.json()
        except Exception as e:
            print(f"Overpass failed on {url}: {e}")
    return None

def get_wikipedia_image(lang: str, page: str):
    try:
        res = requests.get(
            f"https://{lang}.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "titles": page,
                "prop": "pageimages",
                "format": "json",
                "pithumbsize": 600
            },
            headers=HEADERS,
            timeout=8
        )
        res.raise_for_status()

        pages = res.json().get("query", {}).get("pages", {})
        for p in pages.values():
            return p.get("thumbnail", {}).get("source")
    except Exception:
        pass

    return None

def get_wikidata_image(wikidata_id: str):
    try:
        res = requests.get(
            f"https://www.wikidata.org/wiki/Special:EntityData/{wikidata_id}.json",
            headers=HEADERS,
            timeout=8
        )
        res.raise_for_status()

        entity = res.json()["entities"].get(wikidata_id, {})
        claims = entity.get("claims", {})

        if "P18" in claims:
            filename = claims["P18"][0]["mainsnak"]["datavalue"]["value"]
            return f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename.replace(' ', '_')}"
    except Exception:
        pass

    return None

def get_place_recommendations(place_id: str, limit: int = 9):
    try:
        mongo_id = ObjectId(place_id)
    except Exception:
        return {"available": False, "items": []}

    cache = db.recommendations_cache.find_one({
        "place_id": mongo_id,
        "radius": DEFAULT_RADIUS,
        "limit": limit,
        "created_at": {
            "$gte": datetime.utcnow() - timedelta(hours=CACHE_HOURS)
        }
    })

    if cache:
        return {
            "available": bool(cache["items"]),
            "items": cache["items"]
        }

    place = db.places.find_one({"_id": mongo_id})
    if not place:
        return {"available": False, "items": []}

    lat = float(place["lat"])
    lon = float(place["lon"])

    query = f"""
    [out:json][timeout:25];
    (
      node["tourism"~"museum|attraction|viewpoint|gallery"](around:{DEFAULT_RADIUS},{lat},{lon});
      way["tourism"~"museum|attraction|viewpoint|gallery"](around:{DEFAULT_RADIUS},{lat},{lon});
      relation["tourism"~"museum|attraction|viewpoint|gallery"](around:{DEFAULT_RADIUS},{lat},{lon});
      node["historic"](around:{DEFAULT_RADIUS},{lat},{lon});
      way["historic"](around:{DEFAULT_RADIUS},{lat},{lon});
      relation["historic"](around:{DEFAULT_RADIUS},{lat},{lon});
    );
    out center;
    """

    data = overpass_request(query)
    if not data:
        return {"available": False, "items": []}

    items = []

    for el in data.get("elements", []):
        tags = el.get("tags", {})
        name = tags.get("name")

        if not name:
            continue

        lat_el = el.get("lat") or el.get("center", {}).get("lat")
        lon_el = el.get("lon") or el.get("center", {}).get("lon")

        wikidata = tags.get("wikidata")
        wikipedia = tags.get("wikipedia")

        wiki_url = None
        lang = page = None

        if wikipedia:
            lang, page = wikipedia.split(":", 1) if ":" in wikipedia else ("en", wikipedia)
            wiki_url = f"https://{lang}.wikipedia.org/wiki/{page}"
        elif wikidata:
            wiki_url = f"https://www.wikidata.org/wiki/{wikidata}"

        image = tags.get("image")

        if not image and wikipedia:
            image = get_wikipedia_image(lang, page)

        if not image and wikidata:
            image = get_wikidata_image(wikidata)

        items.append({
            "name": name,
            "lat": lat_el,
            "lon": lon_el,
            "wiki_url": wiki_url,
            "image": image
        })

        if len(items) >= limit:
            break

    db.recommendations_cache.insert_one({
        "place_id": mongo_id,
        "radius": DEFAULT_RADIUS,
        "limit": limit,
        "items": items,
        "created_at": datetime.utcnow()
    })

    return {
        "available": bool(items),
        "items": items
    }