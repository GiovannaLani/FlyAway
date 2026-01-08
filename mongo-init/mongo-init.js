db = db.getSiblingDB("flyaway")

db.weather.createIndex(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
)

db.recommendations_cache.createIndex(
  { expires_at: 1 },
  { expireAfterSeconds: 0 }
)