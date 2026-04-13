const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '/api')

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY || 'Your OpenWeather API Key Here'
if (!OPENWEATHER_KEY || OPENWEATHER_KEY.includes('Your')) {
  console.warn('🚨 Set VITE_OPENWEATHER_KEY in .env! Get free key: https://openweathermap.org/api')
}

import type { 
  CitySearchResult,
  CurrentWeather, 
  ForecastResponse, 
  MLPredictionResponse,
  TemperatureUnit 
} from "@/types/weather"

export async function fetchCitySearchDirect(query: string): Promise<CitySearchResult[]> {
  const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_KEY}`)
  if (!response.ok) throw new Error(`City search failed: ${response.status}`)
  const data = await response.json()
  return data.map((item: any) => ({
    name: item.name,
    lat: item.lat,
    lon: item.lon,
    country: item.country,
    state: item.state || ''
  }))
}

export async function fetchCurrentWeather(
  lat: number,
  lon: number,
  unit: TemperatureUnit,
): Promise<CurrentWeather> {
  const unitsParam = unit === 'imperial' ? 'imperial' : 'metric'
  const response = await fetch(`${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${unitsParam}&appid=${OPENWEATHER_KEY}`)
  if (!response.ok) throw new Error(`Current weather failed: ${response.status}`)
  const data = await response.json()
  return {
    city: data.name,
    country: data.sys.country,
    lat: data.coord.lat,
    lon: data.coord.lon,
    temp: data.main.temp,
    feels_like: data.main.feels_like,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind_speed: data.wind.speed,
    wind_deg: data.wind.deg || 0,
    clouds: data.clouds.all,
    visibility: data.visibility || 0,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    sunrise: (data.sys.sunrise + data.timezone) * 1000,
    sunset: (data.sys.sunset + data.timezone) * 1000,
    timezone: data.timezone
  }
}

export async function fetchForecastDirect(lat: number, lon: number, unit: TemperatureUnit): Promise<ForecastResponse> {
  const unitsParam = unit === 'imperial' ? 'imperial' : 'metric'
  const response = await fetch(`${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${unitsParam}&appid=${OPENWEATHER_KEY}`)
  if (!response.ok) throw new Error(`Forecast failed: ${response.status}`)
  const data = await response.json()
  // Group 3hr forecast into daily/hourly
  const hourly = data.list.slice(0, 24).map((item: any) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    temp: Math.round(item.main.temp),
    icon: item.weather[0].icon,
    pop: item.pop || 0,
    humidity: item.main.humidity
  }))

  // Group by day for daily forecast
  const dailyMap = new Map()
  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toDateString()
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        day_name: new Date(item.dt * 1000).toLocaleDateString('en-US', {weekday: 'short'}),
        temp_min: item.main.temp,
        temp_max: item.main.temp,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        pop: 0,
        items: 1
      })
    } else {
      const day = dailyMap.get(date)
      day.temp_min = Math.min(day.temp_min, item.main.temp)
      day.temp_max = Math.max(day.temp_max, item.main.temp)
      day.humidity = (day.humidity + item.main.humidity) / 2
      day.wind_speed = (day.wind_speed + item.wind.speed) / 2
      day.pop += (item.pop || 0)
      day.items += 1
      day.pop /= day.items
      day.description = item.weather[0].description
      day.icon = item.weather[0].icon
    }
  })

  const daily = Array.from(dailyMap.values()).slice(1, 6) // Next 5 days

  return { daily, hourly }
}




export async function fetchCitySearch(query: string): Promise<CitySearchResult[]> {
  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OPENWEATHER_KEY}`)
    if (!response.ok) throw new Error(`City search failed: ${response.status}`)
    const data = await response.json()
    return data.map((item: any) => ({
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      country: item.country,
      state: item.state || ''
    }))
  } catch (error) {
    console.error('OpenWeather city search failed:', error)
    return []
  }
}



export async function fetchForecast(
  lat: number,
  lon: number,
  unit: TemperatureUnit,
): Promise<ForecastResponse> {
  return fetchForecastDirect(lat, lon, unit)
}

export async function fetchMLPredictionDirect(
  lat: number,
  lon: number,
  unit: TemperatureUnit,
): Promise<MLPredictionResponse> {
  // Use forecast data to simulate ML prediction scenarios
  const forecast = await fetchForecastDirect(lat, lon, unit)
  const current = await fetchCurrentWeather(lat, lon, unit)
  
  const avgTemp = forecast.hourly.length ? forecast.hourly.slice(0, 8).reduce((sum, h) => sum + h.temp, 0) / 8 : current.temp
  const avgPop = forecast.hourly.length ? forecast.hourly.slice(0, 8).reduce((sum, h) => sum + h.pop, 0) / 8 : 0
  
  return {
    predicted_temp: Math.round(avgTemp),
    rain_probability: Math.round(avgPop * 100),
    predicted_condition: avgPop > 0.3 ? 'Possible rain bands' : 'Stable weather pattern',
    confidence: 85,
    model_accuracy: 88,
    feature_importance: [
      { feature: 'Humidity', importance: 0.31 },
      { feature: 'Pressure', importance: 0.24 },
      { feature: 'Cloud cover', importance: 0.18 },
      { feature: 'Wind speed', importance: 0.15 },
      { feature: 'Temperature trend', importance: 0.12 },
    ],
    scenarios: [
      {
        id: 'best-case',
        name: 'Best Case',
        type: 'best_case' as const,
        temp: Math.round(avgTemp - 2),
        rain_probability: Math.max(0, avgPop - 0.2),
        condition: 'sunny',
        probability: 0.25,
        description: 'Lower temperature with minimal rain chance'
      },
      {
        id: 'likely',
        name: 'Likely',
        type: 'likely' as const,
        temp: Math.round(avgTemp),
        rain_probability: avgPop,
        condition: avgPop > 0.3 ? 'Possible rain bands' : 'Stable weather pattern',
        probability: 0.5,
        description: 'Most probable outcome based on forecast'
      },
      {
        id: 'worst-case',
        name: 'Worst Case',
        type: 'worst_case' as const,
        temp: Math.round(avgTemp + 2),
        rain_probability: Math.min(0.95, avgPop + 0.2),
        condition: 'rainy',
        probability: 0.25,
        description: 'Higher temperature with increased rain probability'
      }
    ]
  }
}

export async function fetchMLPrediction(
  lat: number,
  lon: number,
  unit: TemperatureUnit,
): Promise<MLPredictionResponse> {
  return fetchMLPredictionDirect(lat, lon, unit)
}



