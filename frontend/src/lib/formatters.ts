import type { TemperatureUnit } from "@/types/weather"

export function formatTemp(temp: number, unit: TemperatureUnit): string {
  const symbol = unit === "metric" ? "°C" : "°F"
  return `${Math.round(temp)}${symbol}`
}

export function formatTempValue(temp: number): string {
  return `${Math.round(temp)}`
}

export function formatTempSymbol(unit: TemperatureUnit): string {
  return unit === "metric" ? "°C" : "°F"
}

export function formatWindSpeed(speed: number, unit: TemperatureUnit): string {
  if (unit === "metric") return `${Math.round(speed)} m/s`
  return `${Math.round(speed)} mph`
}

export function formatWindDir(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  return dirs[Math.round(deg / 45) % 8]
}

export function formatVisibility(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
  return `${meters} m`
}

export function formatPressure(hpa: number): string {
  return `${hpa} hPa`
}

export function formatTime(localUnixMs: number): string {
  return new Date(localUnixMs).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
  return date.toLocaleDateString([], { weekday: "short" })
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getWeatherGradient(icon: string): string {
  if (icon.startsWith("01")) return "from-amber-500/20 to-orange-400/10"
  if (icon.startsWith("02") || icon.startsWith("03"))
    return "from-sky-500/20 to-slate-400/10"
  if (icon.startsWith("04")) return "from-slate-500/20 to-slate-400/10"
  if (icon.startsWith("09") || icon.startsWith("10"))
    return "from-blue-600/20 to-sky-500/10"
  if (icon.startsWith("11")) return "from-purple-600/20 to-slate-500/10"
  if (icon.startsWith("13")) return "from-cyan-300/20 to-blue-300/10"
  if (icon.startsWith("50")) return "from-slate-400/20 to-slate-300/10"
  return "from-sky-500/20 to-cyan-400/10"
}
