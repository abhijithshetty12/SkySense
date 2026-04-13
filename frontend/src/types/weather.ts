export type TemperatureUnit = "metric" | "imperial"

export interface CitySearchResult {
  name: string
  lat: number
  lon: number
  country: string
  state: string
}

export interface CurrentWeather {
  city: string
  country: string
  lat: number
  lon: number
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  humidity: number
  wind_speed: number
  wind_deg: number
  pressure: number
  visibility: number
  description: string
  icon: string
  sunrise: number
  sunset: number
  clouds: number
  uv_index?: number
  timezone: number
}

export interface ForecastDay {
  date: string
  day_name: string
  temp_min: number
  temp_max: number
  humidity: number
  wind_speed: number
  description: string
  icon: string
  pop: number
}

export interface HourlyPoint {
  time: string
  temp: number
  icon: string
  pop: number
  humidity: number
}

export interface ForecastResponse {
  daily: ForecastDay[]
  hourly: HourlyPoint[]
}

export interface FeatureImportance {
  feature: string
  importance: number
}

export interface Scenario {
  id: string
  name: string
  type: "best_case" | "likely" | "worst_case"
  temp: number
  rain_probability: number
  condition: string
  probability: number
  description: string
}

export interface MLPredictionResponse {
  predicted_temp: number
  rain_probability: number
  predicted_condition: string
  confidence: number
  model_accuracy: number
  feature_importance: FeatureImportance[]
  scenarios?: Scenario[]
}

export interface Recommendation {
  id: string
  category: string
  title: string
  description: string
  priority: string
  action: string
}

export interface RecommendationsResponse {
  recommendations: Recommendation[]
  generated_at: string
}
