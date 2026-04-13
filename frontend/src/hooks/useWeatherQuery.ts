import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchMLPrediction,
} from "@/lib/api"
import type { TemperatureUnit } from "@/types/weather"
import { useWeatherStore } from "@/store/weatherStore"

export function useCurrentWeather(unit: TemperatureUnit) {
  const { lat, lon } = useWeatherStore()
  
  const query = useQuery({
    queryKey: ["weather", lat, lon, unit],
    queryFn: () => fetchCurrentWeather(lat, lon, unit),
    enabled: !!lat && !!lon,
    staleTime: 30 * 1000,
    retry: 2,
  })

  return query
}

export function useForecast(unit: TemperatureUnit) {
  const { lat, lon } = useWeatherStore()
  
  const query = useQuery({
    queryKey: ["forecast", lat, lon, unit],
    queryFn: () => fetchForecast(lat, lon, unit),
    enabled: !!lat && !!lon,
    staleTime: 30 * 1000,
    retry: 2,
  })

  return query
}

export function useMLPrediction(unit: TemperatureUnit) {
  const { lat, lon } = useWeatherStore()
  
  const query = useQuery({
    queryKey: ["predict", lat, lon, unit],
    queryFn: () => fetchMLPrediction(lat, lon, unit),
    enabled: !!lat && !!lon,
    staleTime: 30 * 1000,
    retry: 1,
  })

  return query
}
