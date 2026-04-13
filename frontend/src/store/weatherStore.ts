import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TemperatureUnit } from "@/types/weather"

interface WeatherStore {
  city: string
  lat: number
  lon: number
  unit: TemperatureUnit
  setCity: (city: string, lat: number, lon: number) => void
  setLatLon: (lat: number, lon: number) => void
  setUnit: (unit: TemperatureUnit) => void
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set) => ({
      city: "Mumbai",
      lat: 19.076,
      lon: 72.8777,
      unit: "metric",
      setCity: (city, lat, lon) => set({ city, lat, lon }),
      setLatLon: (lat, lon) => set({ lat, lon }),
      setUnit: (unit) => set({ unit }),
    }),
    { name: "skysense-prefs" }
  )
)
