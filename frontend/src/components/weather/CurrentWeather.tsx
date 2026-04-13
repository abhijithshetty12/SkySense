import { Skeleton } from "@/components/ui/skeleton"
import { WeatherIcon } from "./WeatherIcon"
import { formatTemp, formatTime, capitalize, getWeatherGradient } from "@/lib/formatters"
import type { CurrentWeather as ICurrentWeather, TemperatureUnit } from "@/types/weather"
import { Sunrise, Sunset, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface CurrentWeatherProps {
  data?: ICurrentWeather
  unit: TemperatureUnit
  isLoading: boolean
}

export function CurrentWeather({ data, unit, isLoading }: CurrentWeatherProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--card)", backdropFilter: "blur(20px)", border: "1px solid var(--border)" }}>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-48" />
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const gradient = getWeatherGradient(data.icon)

  return (
    <div
      className={cn(
        "rounded-2xl p-6 relative overflow-hidden",
      )}
      style={{
        background: "var(--card),0.6)",
        backdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 60px rgba(56,189,248,0.08)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top right, rgba(56,189,248,0.12) 0%, transparent 60%)`,
        }}
      />

      <div className="relative">
        {/* Location */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {data.city}
              <span className="text-muted-foreground font-normal text-sm ml-1.5">
                {data.country}
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <WeatherIcon code={data.icon} size={48} />
        </div>

        {/* Temperature */}
        <div className="flex items-end gap-3 mb-2">
          <span
            className="font-bold text-foreground leading-none"
            style={{ fontSize: "5rem" }}
          >
            {Math.round(data.temp)}
          </span>
          <span className="text-3xl text-muted-foreground mb-3 font-light">
            {unit === "metric" ? "°C" : "°F"}
          </span>
        </div>

        {/* Condition */}
        <p className="text-sm text-muted-foreground mb-4">
          {capitalize(data.description)} · Feels like{" "}
          <span className="text-foreground font-medium">
            {formatTemp(data.feels_like, unit)}
          </span>
        </p>

        {/* High / Low + Sunrise/Sunset */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <ArrowUp className="text-danger" style={{ width: 12, height: 12 }} />
            {formatTemp(data.temp_max, unit)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <ArrowDown className="text-sky-blue" style={{ width: 12, height: 12 }} />
            {formatTemp(data.temp_min, unit)}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Sunrise
              className="text-amber-400"
              style={{ width: 13, height: 13 }}
            />
            {formatTime(data.sunrise)}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Sunset
              className="text-orange-400"
              style={{ width: 13, height: 13 }}
            />
            {formatTime(data.sunset)}
          </span>
        </div>
      </div>
    </div>
  )
}
