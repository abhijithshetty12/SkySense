import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTempSymbol } from "@/lib/formatters"
import type { HourlyPoint, TemperatureUnit } from "@/types/weather"

interface WeatherChartProps {
  data?: HourlyPoint[]
  unit: TemperatureUnit
  isLoading: boolean
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number; payload: HourlyPoint }[]
  label?: string
  unit: TemperatureUnit
}

function CustomTooltip({ active, payload, label, unit }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg border border-border px-3 py-2 text-xs"
      style={{ background: "var(--card),0.95)", backdropFilter: "blur(8px)" }}
    >
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-foreground">
        {Math.round(payload[0].value)}
        {formatTempSymbol(unit)}
      </p>
      <p className="text-primary">
        Rain: {Math.round((payload[0].payload.pop ?? 0) * 100)}%
      </p>
    </div>
  )
}

export function WeatherChart({ data, unit, isLoading }: WeatherChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl p-6" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border),0.12)" }}>
        <Skeleton className="h-4 w-40 mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!data?.length) return null

  const symbol = formatTempSymbol(unit)

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border),0.12)", boxShadow: "0 4px 30px rgba(0,0,0,0.2)" }}>
      <h3 className="text-sm font-medium text-foreground mb-1">
        24h Temperature Trend
      </h3>
      <p className="label-meta text-muted-foreground mb-5">
        Hourly forecast · {symbol}
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}${symbol}`}
          />
          <Tooltip
            content={<CustomTooltip unit={unit} />}
            cursor={{ stroke: "rgba(192,192,192,0.2)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#tempGrad)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--primary)",
              stroke: "var(--card)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
