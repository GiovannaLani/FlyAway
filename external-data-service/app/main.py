from fastapi import FastAPI
from app.routes import places, weather, currency, recommendations

app = FastAPI(title="Travel Info Service")

app.include_router(places.router)
app.include_router(weather.router)
app.include_router(currency.router)
app.include_router(recommendations.router)

@app.get("/")
def root():
    return {"message": "Travel Info Service is running"}