"""
SkySense – FastAPI backend
Endpoints:
  GET /weather?city=London&units=metric
  GET /forecast?city=London&units=metric
  GET /predict?city=London&units=metric
"""

from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .schemas import CurrentWeatherResponse, ForecastResponse, MLPredictionResponse, RecommendationsResponse
from .weather_service import get_current_weather, get_forecast
from .ml_model import get_model
import httpx
from datetime import datetime


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-train model on startup so first request is fast
    get_model()
    yield


app = FastAPI(
    title="SkySense API",
    description="Weather prediction API powered by OpenWeatherMap + scikit-learn",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "SkySense API is running"}


@app.get("/search", tags=["Search"])
async def search(
    q: str = Query(..., min_length=1, description="City search query"),
    limit: int = Query(5, ge=1, le=10)
):
    try:
        from .weather_service import API_KEY, BASE_URL
        geo_url = f"https://api.openweathermap.org/geo/1.0/direct"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(geo_url, params={"q": q, "limit": limit, "appid": API_KEY})
            resp.raise_for_status()
            data = resp.json()
        
        results = []
        for item in data:
            results.append({
                "name": f"{item['name']}, {item.get('state', '') or item['country']}",
                "lat": item["lat"],
                "lon": item["lon"],
                "country": item["country"],
                "state": item.get("state", "")
            })
        return results
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return []
        raise HTTPException(status_code=502, detail="Search API error")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/weather", response_model=CurrentWeatherResponse, tags=["Weather"])
async def weather(
    city: str = Query(..., min_length=1, description="City name"),
    units: Literal["metric", "imperial"] = Query("metric"),
):
    try:
        data = await get_current_weather(city, units)
        return data
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        raise HTTPException(status_code=502, detail=f"Weather API error: {e.response.status_code}")
    except httpx.ConnectError as e:
        raise HTTPException(status_code=502, detail="Cannot connect to weather API. Check your internet connection.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.get("/forecast", response_model=ForecastResponse, tags=["Weather"])
async def forecast(
    city: str = Query(..., min_length=1),
    units: Literal["metric", "imperial"] = Query("metric"),
):
    try:
        data = await get_forecast(city, units)
        return data
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        raise HTTPException(status_code=502, detail=f"Weather API error: {e.response.status_code}")
    except httpx.ConnectError as e:
        raise HTTPException(status_code=502, detail="Cannot connect to weather API. Check your internet connection.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.get("/predict", response_model=MLPredictionResponse, tags=["ML"])
async def predict(
    city: str = Query(..., min_length=1),
    units: Literal["metric", "imperial"] = Query("metric"),
):
    try:
        # Fetch current conditions to use as model features
        weather_data = await get_current_weather(city, units)
        model = get_model()
        result = model.predict(weather_data)
        return result
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        raise HTTPException(status_code=502, detail=f"Weather API error: {e.response.status_code}")
    except httpx.ConnectError as e:
        raise HTTPException(status_code=502, detail="Cannot connect to weather API. Check your internet connection.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


def _generate_recommendations(weather: dict, prediction: dict) -> list:
    """Generate AI-driven recommendations based on weather conditions."""
    recommendations = []
    temp = weather.get("temp", 20)
    humidity = weather.get("humidity", 50)
    wind_speed = weather.get("wind_speed", 0)
    rain_prob = prediction.get("rain_probability", 0) if prediction else 0
    pressure = weather.get("pressure", 1013)
    
    if rain_prob < 0.3 and temp >= 15 and temp <= 28 and humidity >= 40 and humidity <= 70:
        recommendations.append({
            "id": "harvest-1",
            "category": "Agriculture",
            "title": "Best Time to Harvest",
            "description": "Ideal conditions for harvesting crops. Low humidity and moderate temperatures will prevent mold and ensure proper drying.",
            "priority": "high",
            "action": "Schedule harvest for today"
        })
    
    if rain_prob >= 0.5:
        recommendations.append({
            "id": "harvest-delay",
            "category": "Agriculture",
            "title": "Delay Harvesting",
            "description": f"High rain probability ({int(rain_prob * 100)}%). Postpone harvesting to prevent crop damage and moisture buildup.",
            "priority": "medium",
            "action": "Check again tomorrow"
        })
    
    if wind_speed > 25:
        recommendations.append({
            "id": "construction-1",
            "category": "Construction",
            "title": "Construction Safety Alert",
            "description": f"High wind speed ({wind_speed:.1f} km/h). Crane operations and tall structures pose serious risks.",
            "priority": "high",
            "action": "Suspend crane operations and secure loose materials"
        })
    elif wind_speed > 15:
        recommendations.append({
            "id": "construction-2",
            "category": "Construction",
            "title": "Elevated Wind Warning",
            "description": f"Moderate winds ({wind_speed:.1f} km/h). Use caution with scaffolding and elevated work.",
            "priority": "medium",
            "action": "Review safety measures"
        })
    
    if rain_prob > 0.4:
        recommendations.append({
            "id": "construction-3",
            "category": "Construction",
            "title": "Rain Safety Alert",
            "description": "Wet conditions expected. Surfaces may be slippery; electrical work should be avoided.",
            "priority": "high",
            "action": "Halt electrical work and use fall protection"
        })
    
    if temp > 32:
        recommendations.append({
            "id": "health-1",
            "category": "Health",
            "title": "Extreme Heat Warning",
            "description": f"Temperature {temp:.0f}°C. Risk of heat exhaustion and dehydration.",
            "priority": "high",
            "action": "Stay hydrated, take breaks in shade"
        })
    elif temp > 28:
        recommendations.append({
            "id": "health-2",
            "category": "Health",
            "title": "Heat Advisory",
            "description": f"High temperature {temp:.0f}°C. Stay hydrated and avoid prolonged sun exposure.",
            "priority": "medium",
            "action": "Stay hydrated"
        })
    
    if temp < 5:
        recommendations.append({
            "id": "health-3",
            "category": "Health",
            "title": "Cold Weather Alert",
            "description": f"Temperature {temp:.0f}°C. Risk of hypothermia for outdoor workers.",
            "priority": "medium",
            "action": "Wear insulated clothing"
        })
    
    if humidity > 85:
        recommendations.append({
            "id": "health-4",
            "category": "Health",
            "title": "High Humidity Advisory",
            "description": f"High humidity ({humidity}%). Reduced ability to cool down; stay hydrated.",
            "priority": "medium",
            "action": "Take frequent breaks"
        })
    
    if pressure < 1000:
        recommendations.append({
            "id": "outdoor-1",
            "category": "Outdoor",
            "title": "Low Pressure System",
            "description": "Low atmospheric pressure may indicate approaching storms. Check forecasts.",
            "priority": "medium",
            "action": "Monitor weather updates"
        })
    
    if rain_prob < 0.2 and temp >= 18 and temp <= 26 and wind_speed < 15:
        recommendations.append({
            "id": "outdoor-2",
            "category": "Outdoor",
            "title": "Perfect Outdoor Conditions",
            "description": "Ideal weather for outdoor activities, sports, and events.",
            "priority": "low",
            "action": "Enjoy outdoor activities"
        })
    
    if humidity < 30:
        recommendations.append({
            "id": "agriculture-1",
            "category": "Agriculture",
            "title": "Low Humidity Alert",
            "description": f"Low humidity ({humidity}%). Consider irrigation for crops and soil moisture management.",
            "priority": "medium",
            "action": "Water crops"
        })
    
    if len(recommendations) == 0:
        recommendations.append({
            "id": "general-1",
            "category": "General",
            "title": "No Weather Alerts",
            "description": "Weather conditions are normal. No special precautions needed.",
            "priority": "low",
            "action": "Continue normal activities"
        })
    
    return recommendations


@app.get("/recommendations", response_model=RecommendationsResponse, tags=["Recommendations"])
async def recommendations(
    city: str = Query(..., min_length=1),
    units: Literal["metric", "imperial"] = Query("metric"),
):
    try:
        weather_data = await get_current_weather(city, units)
        model = get_model()
        prediction = model.predict(weather_data)
        
        recs = _generate_recommendations(weather_data, prediction)
        
        return {
            "recommendations": recs,
            "generated_at": datetime.now().isoformat()
        }
    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        raise HTTPException(status_code=502, detail=f"Weather API error: {e.response.status_code}")
    except httpx.ConnectError as e:
        raise HTTPException(status_code=502, detail="Cannot connect to weather API. Check your internet connection.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
