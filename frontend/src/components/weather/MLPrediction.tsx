import { Brain, TrendingUp, CloudRain, Gauge, Info, TrendingDown, Minus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Cell } from "recharts"
import { formatTempSymbol } from "@/lib/formatters"
import type { MLPredictionResponse, TemperatureUnit, Scenario } from "@/types/weather"

interface MLPredictionProps {
  data?: MLPredictionResponse
  unit: TemperatureUnit
  isLoading: boolean
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value)
  const variant =
    pct >= 80 ? "default" : pct >= 60 ? "secondary" : "outline"
  const label = pct >= 80 ? "High confidence" : pct >= 60 ? "Moderate" : "Low confidence"
  return (
    <Badge variant={variant} className="text-xs">
      {label} · {pct}%
    </Badge>
  )
}

const scenarioColors = {
  best_case: "var(--success)",
  likely: "var(--primary)",
  worst_case: "var(--danger)",
}

const scenarioIcons = {
  best_case: TrendingDown,
  likely: Minus,
  worst_case: TrendingUp,
}

function ScenarioCard({ scenario, symbol }: { scenario: Scenario; symbol: string }) {
  const Icon = scenarioIcons[scenario.type as keyof typeof scenarioIcons] || Minus
  const color = scenarioColors[scenario.type as keyof typeof scenarioColors] || "var(--muted-foreground)"
  const probPct = Math.round(scenario.probability * 100)
  
  return (
    <div 
      className="rounded-xl p-4 space-y-2"
      style={{ 
background: "var(--card)",
        border: `1px solid ${color}30`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon style={{ width: 14, height: 14, color }} />
          <span className="text-sm font-semibold" style={{ color }}>{scenario.name}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
          {probPct}% chance
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-xl font-bold font-mono">{Math.round(scenario.temp)}</span>
        <span className="text-sm text-muted-foreground">{symbol}</span>
        <span className="text-sm text-muted-foreground">·</span>
        <span className="text-sm font-mono" style={{ color: scenario.rain_probability > 0.5 ? "var(--primary)" : "var(--success)" }}>
          {Math.round(scenario.rain_probability * 100)}% rain
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{scenario.description}</p>
    </div>
  )
}

export function MLPrediction({ data, unit, isLoading }: MLPredictionProps) {
  const symbol = formatTempSymbol(unit)

  if (isLoading) {
    return (
      <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border),0.12)" }}>
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!data) return null

  const rainPct = Math.round(data.rain_probability)
  const chartData = data.feature_importance.slice(0, 6).map((f) => ({
    feature: f.feature
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    importance: Math.round(f.importance * 100),
  }))

  return (
    <div className="rounded-2xl p-6 space-y-6" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border),0.12)", boxShadow: "0 4px 30px rgba(0,0,0,0.2)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="rounded-lg p-2"
            style={{ background: "rgba(56,189,248,0.15)", boxShadow: "0 0 20px rgba(56,189,248,0.1)" }}
          >
            <Brain
              className="text-sky-blue"
              style={{ width: 18, height: 18 }}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              ML Prediction · Tomorrow
            </h3>
            <p className="text-xs text-muted-foreground">
              Random Forest · Accuracy {Math.round(data.model_accuracy)}%
            </p>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="text-muted-foreground hover:text-foreground transition-colors" />
            }
          >
            <Info style={{ width: 15, height: 15 }} />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-xs">
            Predictions use a Random Forest model trained on synthetic weather
            pattern data. Features include temperature, humidity, pressure,
            wind speed, cloud cover, and season.
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Prediction metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4 space-y-1" style={{ background: "var(--card)", border: "1px solid var(--border),0.1)" }}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp style={{ width: 12, height: 12 }} />
            <span className="label-meta">Temp</span>
          </div>
          <p className="text-2xl font-bold text-foreground font-mono">
            {Math.round(data.predicted_temp)}
            <span className="text-lg font-normal text-muted-foreground">
              {symbol}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">Predicted</p>
        </div>

        <div className="rounded-xl p-4 space-y-1" style={{ background: "var(--card)", border: "1px solid var(--border),0.1)" }}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CloudRain style={{ width: 12, height: 12 }} />
            <span className="label-meta">Rain</span>
          </div>
          <p className="text-2xl font-bold font-mono"
            style={{ color: rainPct > 60 ? "var(--primary)" : rainPct > 30 ? "var(--warning)" : "var(--success)" }}
          >
            {rainPct}
            <span className="text-lg font-normal text-muted-foreground">%</span>
          </p>
          <p className="text-xs text-muted-foreground">Probability</p>
        </div>

        <div className="rounded-xl p-4 space-y-1" style={{ background: "var(--card)", border: "1px solid var(--border),0.1)" }}>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Gauge style={{ width: 12, height: 12 }} />
            <span className="label-meta">Condition</span>
          </div>
          <p className="text-sm font-semibold text-foreground capitalize mt-1">
            {data.predicted_condition}
          </p>
          <ConfidenceBadge value={data.confidence} />
        </div>
      </div>

      {/* Feature importance chart */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-3 label-meta">
          Feature Importance
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
            barSize={8}
          >
            <XAxis
              type="number"
              hide
              domain={[0, 100]}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={90}
              tick={{ fill: "var(--foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <ReTooltip
              formatter={(v) => [`${v}%`, "Importance"]}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 11,
                color: "var(--foreground)",
              }}
              itemStyle={{ color: "var(--primary)" }}
              labelStyle={{ color: "var(--muted-foreground)" }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={`rgba(0,255,255,${0.95 - i * 0.12})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario-based predictions */}
      {data.scenarios && data.scenarios.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3 label-meta">
            Ensemble Scenarios
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Multiple probable outcomes for better decision-making
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} symbol={symbol} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
