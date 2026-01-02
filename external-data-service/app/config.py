from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
CACHE_DB = os.getenv("CACHE_DB", "travel_cache")