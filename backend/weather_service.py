import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

# Load .env from the backend directory (where this file lives)
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
BASE_URL = "https://api.openweathermap.org/data/2.5"


def _check_key():
    if not API_KEY:
        raise ValueError(
            "OPENWEATHER_API_KEY is not set. "
            "Create a .env file in the backend directory with: OPENWEATHER_API_KEY=your_key_here"
        )


async def get_current_weather(city: str, units: str = "metric") -> dict[str, Any]:
    _check_key()
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{BASE_URL}/weather",
            params={"q": city, "units": units, "appid": API_KEY},
        )
        resp.raise_for_status()
        d = resp.json()

    return {
        "city": d["name"],
        "country": d["sys"]["country"],
        "lat": d["coord"]["lat"],
        "lon": d["coord"]["lon"],
        "temp": d["main"]["temp"],
        "feels_like": d["main"]["feels_like"],
        "temp_min": d["main"]["temp_min"],
        "temp_max": d["main"]["temp_max"],
        "humidity": d["main"]["humidity"],
        "wind_speed": d["wind"].get("speed", 0),
        "wind_deg": d["wind"].get("deg", 0),
        "pressure": d["main"]["pressure"],
        "visibility": d.get("visibility", 10000),
        "description": d["weather"][0]["description"],
        "icon": d["weather"][0]["icon"],
        "sunrise": d["sys"]["sunrise"],
        "sunset": d["sys"]["sunset"],
        "clouds": d["clouds"]["all"],
    }


async def get_forecast(city: str, units: str = "metric") -> dict[str, Any]:
    _check_key()
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{BASE_URL}/forecast",
            params={"q": city, "units": units, "appid": API_KEY, "cnt": 40},
        )
        resp.raise_for_status()
        d = resp.json()

    # Build hourly (next 8 points = 24h)
    hourly = []
    for item in d["list"][:8]:
        dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
        hourly.append(
            {
                "time": dt.strftime("%H:%M"),
                "temp": item["main"]["temp"],
                "icon": item["weather"][0]["icon"],
                "pop": item.get("pop", 0),
                "humidity": item["main"]["humidity"],
            }
        )

    # Build daily (group by date)
    daily_map: dict[str, list] = {}
    for item in d["list"]:
        dt = datetime.fromtimestamp(item["dt"], tz=timezone.utc)
        date_key = dt.strftime("%Y-%m-%d")
        daily_map.setdefault(date_key, []).append(item)

    daily = []
    for date_key, items in list(daily_map.items())[:5]:
        dt = datetime.strptime(date_key, "%Y-%m-%d")
        temps = [i["main"]["temp"] for i in items]
        pops = [i.get("pop", 0) for i in items]
        # use midday item for description/icon
        mid = items[len(items) // 2]
        daily.append(
            {
                "date": date_key,
                "day_name": dt.strftime("%A"),
                "temp_min": min(temps),
                "temp_max": max(temps),
                "humidity": int(
                    sum(i["main"]["humidity"] for i in items) / len(items)
                ),
                "wind_speed": mid["wind"].get("speed", 0),
                "description": mid["weather"][0]["description"],
                "icon": mid["weather"][0]["icon"],
                "pop": max(pops),
            }
        )

    return {"daily": daily, "hourly": hourly}
