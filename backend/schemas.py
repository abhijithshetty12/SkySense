from pydantic import BaseModel
from typing import List


class CurrentWeatherResponse(BaseModel):
    city: str
    country: str
    lat: float
    lon: float
    temp: float
    feels_like: float
    temp_min: float
    temp_max: float
    humidity: int
    wind_speed: float
    wind_deg: int
    pressure: int
    visibility: int
    description: str
    icon: str
    sunrise: int
    sunset: int
    clouds: int


class ForecastDay(BaseModel):
    date: str
    day_name: str
    temp_min: float
    temp_max: float
    humidity: int
    wind_speed: float
    description: str
    icon: str
    pop: float


class HourlyPoint(BaseModel):
    time: str
    temp: float
    icon: str
    pop: float
    humidity: int


class ForecastResponse(BaseModel):
    daily: List[ForecastDay]
    hourly: List[HourlyPoint]


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class Scenario(BaseModel):
    id: str
    name: str
    type: str
    temp: float
    rain_probability: float
    condition: str
    probability: float
    description: str


class CitySearchResult(BaseModel):
    name: str
    lat: float
    lon: float
    country: str
    state: str = ""


class MLPredictionResponse(BaseModel):
    predicted_temp: float
    rain_probability: float
    predicted_condition: str
    confidence: float
    model_accuracy: float
    feature_importance: List[FeatureImportance]
    scenarios: List[Scenario] = []


class Recommendation(BaseModel):
    id: str
    category: str
    title: str
    description: str
    priority: str
    action: str


class RecommendationsResponse(BaseModel):
    recommendations: List[Recommendation]
    generated_at: str
