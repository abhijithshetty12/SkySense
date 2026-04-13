import { Droplets, Wind, Gauge, Eye, Cloud, Compass } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  formatWindSpeed,
  formatWindDir,
  formatVisibility,
  formatPressure,
} from "@/lib/formatters"
import type { CurrentWeather, TemperatureUnit } from "@/types/weather"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  progress?: number
  color?: string
}

function StatCard({ icon, label, value, sub, progress, color = "var(--primary)" }: StatCardProps) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
      <div className="flex items-center justify-between">
        <span className="label-meta" style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <span style={{ color: "var(--muted-foreground)" }}>{icon}</span>
      </div>
      <div>
        <span className="data-value" style={{ color: "var(--foreground)" }}>{value}</span>
        {sub && <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
      </div>
      {progress !== undefined && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: color,
              boxShadow: `0 0 10px ${color}50`,
            }}
          />
        </div>
      )}
    </div>
  )
}

interface WeatherStatsProps {
  data?: CurrentWeather
  unit: TemperatureUnit
  isLoading: boolean
}

export function WeatherStats({ data, unit, isLoading }: WeatherStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border),0.12)" }}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-1 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatCard
        icon={<Droplets style={{ width: 16, height: 16 }} />}
        label="Humidity"
        value={`${data.humidity}%`}
        sub={
          data.humidity > 70
            ? "High"
            : data.humidity > 40
              ? "Moderate"
              : "Low"
        }
        progress={data.humidity}
        color="var(--primary)"
      />
      <StatCard
        icon={<Wind style={{ width: 16, height: 16 }} />}
        label="Wind"
        value={formatWindSpeed(data.wind_speed, unit)}
        sub={formatWindDir(data.wind_deg)}
        progress={Math.min((data.wind_speed / 30) * 100, 100)}
        color="var(--cyan)"
      />
      <StatCard
        icon={<Gauge style={{ width: 16, height: 16 }} />}
        label="Pressure"
        value={formatPressure(data.pressure)}
        sub={
          data.pressure > 1020
            ? "High pressure"
            : data.pressure < 1000
              ? "Low pressure"
              : "Normal"
        }
        progress={Math.round(((data.pressure - 970) / 70) * 100)}
        color="var(--muted-foreground)"
      />
      <StatCard
        icon={<Eye style={{ width: 16, height: 16 }} />}
        label="Visibility"
        value={formatVisibility(data.visibility)}
        sub={
          data.visibility >= 10000
            ? "Excellent"
            : data.visibility >= 5000
              ? "Good"
              : "Poor"
        }
        progress={Math.min((data.visibility / 10000) * 100, 100)}
        color="var(--success)"
      />
      <StatCard
        icon={<Cloud style={{ width: 16, height: 16 }} />}
        label="Cloud Cover"
        value={`${data.clouds}%`}
        sub={
          data.clouds > 75
            ? "Overcast"
            : data.clouds > 25
              ? "Partly cloudy"
              : "Clear"
        }
        progress={data.clouds}
        color="var(--muted-foreground)"
      />
      <StatCard
        icon={<Compass style={{ width: 16, height: 16 }} />}
        label="Wind Dir."
        value={formatWindDir(data.wind_deg)}
        sub={`${data.wind_deg}°`}
        progress={(data.wind_deg / 360) * 100}
        color="var(--warning)"
      />
    </div>
  )
}
