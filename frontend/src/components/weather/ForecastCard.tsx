import { Skeleton } from "@/components/ui/skeleton"
import { WeatherIcon } from "./WeatherIcon"
import { formatTempValue, formatTempSymbol, formatDayName } from "@/lib/formatters"
import type { ForecastDay, TemperatureUnit } from "@/types/weather"
import { Droplets } from "lucide-react"

interface ForecastCardProps {
  day: ForecastDay
  unit: TemperatureUnit
  minTemp: number
  maxTemp: number
}

function ForecastCard({ day, unit, minTemp, maxTemp }: ForecastCardProps) {
  const range = maxTemp - minTemp || 1
  const barStart = ((day.temp_min - minTemp) / range) * 100
  const barWidth = ((day.temp_max - day.temp_min) / range) * 100
  const symbol = formatTempSymbol(unit)

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3 min-w-0" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border),0.12)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground truncate">
          {formatDayName(day.date)}
        </span>
        <WeatherIcon code={day.icon} size={20} />
      </div>

      <p className="text-xs text-muted-foreground truncate capitalize">
        {day.description}
      </p>

      {/* Temp range bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-blue">
            {formatTempValue(day.temp_min)}{symbol}
          </span>
          <span className="text-foreground">
            {formatTempValue(day.temp_max)}{symbol}
          </span>
        </div>
        <div className="h-1.5 rounded-full relative" style={{ background: "var(--border),0.15)" }}>
          <div
            className="absolute h-full rounded-full"
            style={{
              left: `${barStart}%`,
              width: `${barWidth}%`,
              background: "linear-gradient(to right, var(--primary), var(--muted-foreground))",
              boxShadow: "0 0 10px var(--primary)",
            }}
          />
        </div>
      </div>

      {/* Rain chance */}
      {day.pop > 0 && (
        <div className="flex items-center gap-1 text-xs text-sky-blue">
          <Droplets style={{ width: 11, height: 11 }} />
          <span>{Math.round(day.pop * 100)}%</span>
        </div>
      )}
    </div>
  )
}

interface ForecastListProps {
  days?: ForecastDay[]
  unit: TemperatureUnit
  isLoading: boolean
}

export function ForecastList({ days, unit, isLoading }: ForecastListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border),0.12)" }}>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!days?.length) return null

  const allTemps = days.flatMap((d) => [d.temp_min, d.temp_max])
  const minTemp = Math.min(...allTemps)
  const maxTemp = Math.max(...allTemps)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {days.map((day) => (
        <ForecastCard
          key={day.date}
          day={day}
          unit={unit}
          minTemp={minTemp}
          maxTemp={maxTemp}
        />
      ))}
    </div>
  )
}
