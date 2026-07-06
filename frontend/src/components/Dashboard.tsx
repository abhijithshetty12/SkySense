import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  LayoutDashboard,
  RefreshCw,
  Sun,
  Moon,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SearchBar } from "@/components/weather/SearchBar"
import { CurrentWeather } from "@/components/weather/CurrentWeather"
import { WeatherStats } from "@/components/weather/WeatherStats"
import { ForecastList } from "@/components/weather/ForecastCard"
import { WeatherChart } from "@/components/weather/WeatherChart"
import { MLPrediction } from "@/components/weather/MLPrediction"
import { useWeatherStore } from "@/store/weatherStore"
import { useCurrentWeather, useForecast, useMLPrediction } from "@/hooks/useWeatherQuery"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function Dashboard() {
  const { city, unit } = useWeatherStore()
  const { theme, setTheme } = useTheme()

  const weather = useCurrentWeather(unit)
  const forecast = useForecast(unit)
  const prediction = useMLPrediction(unit)

  const isLoading = weather.isLoading

  const [activeTab, setActiveTab] = useState<"overview" | "forecast" | "ai">("overview")

  useEffect(() => {
    if (weather.error) {
      const msg =
        weather.error instanceof Error
          ? weather.error.message
          : "Failed to fetch weather"
      toast.error(`Weather error: ${msg}`)
    }
  }, [weather.error])

  useEffect(() => {
    const handleCityChange = () => {
      weather.refetch()
      forecast.refetch()
      prediction.refetch()
    }
    
    window.addEventListener('weather-city-changed', handleCityChange)
    return () => window.removeEventListener('weather-city-changed', handleCityChange)
  }, [weather, forecast, prediction])

  const handleRefresh = async () => {
    await Promise.all([
      weather.refetch(),
      forecast.refetch(),
      prediction.refetch(),
    ])
    toast.success("Data refreshed")
  }

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-primary/30 overflow-x-hidden relative" style={{ background: "var(--background)" }}>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-72 h-72 sm:w-96 sm:h-96 rounded-full" style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)", opacity: 0.12, filter: "blur(40px)", animation: "float 8s ease-in-out infinite" }} />
        <div className="absolute top-1/3 -left-32 w-60 h-60 sm:w-72 sm:h-72 rounded-full" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)", opacity: 0.1, filter: "blur(32px)", animation: "float 10s ease-in-out infinite reverse" }} />
        <div className="absolute bottom-20 right-1/4 w-52 h-52 sm:w-64 sm:h-64 rounded-full" style={{ background: "radial-gradient(circle, var(--cyan), transparent 70%)", opacity: 0.08, filter: "blur(28px)", animation: "float 12s ease-in-out infinite" }} />
      </div>

      <header
        className="sticky top-0 z-50 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 sm:py-3"
        style={{ 
          background: "var(--card)", 
          backdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <img 
            src="/SkySense-Icon.jpg" 
            alt="SkySense" 
            className="w-7 h-7 sm:w-7 sm:h-7 rounded-lg object-cover"
            style={{ background: "rgba(192,192,192,0.15)" }}
          />
          <span className="font-bold text-sm tracking-tight text-foreground hidden xs:block">
            SkySense
          </span>
        </div>

        <Separator orientation="vertical" className="h-5 hidden sm:block mx-2 bg-white/[0.08]" />

        <div className="flex-1 max-w-md sm:max-w-xl mx-1.5 sm:mx-0">
          <SearchBar isLoading={isLoading} />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isLoading ? "animate-spin" : "")}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 sm:pb-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] uppercase tracking-widest font-bold label-meta">Weather Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Analytics Overview
            </h1>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
            <TabsList 
              className="grid grid-cols-3 w-full sm:w-[360px] p-1 text-xs rounded-xl h-10 sm:h-11" 
              style={{ 
                background: "var(--card)", 
                backdropFilter: "blur(16px)", 
                border: "1px solid var(--border)" 
              }}
            >
              <TabsTrigger 
                value="overview"
                className="rounded-lg text-[11px] sm:text-xs font-bold tracking-wide transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="forecast"
                className="rounded-lg text-[11px] sm:text-xs font-bold tracking-wide transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                Forecast
              </TabsTrigger>
              <TabsTrigger 
                value="ai"
                className="rounded-lg text-[11px] sm:text-xs font-bold tracking-wide transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
              >
                AI Prediction
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="w-full transition-all duration-300 outline-none">
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-start">
                <div className="lg:col-span-1">
                  <CurrentWeather
                    data={weather.data}
                    unit={unit}
                    isLoading={isLoading}
                  />
                </div>
                <div className="lg:col-span-2">
                  <WeatherStats
                    data={weather.data}
                    unit={unit}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              <div className="p-3.5 sm:p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-xl shadow-xl shadow-black/[0.02] overflow-hidden">
                <WeatherChart
                  data={forecast.data?.hourly}
                  unit={unit}
                  isLoading={forecast.isLoading}
                />
              </div>
            </div>
          )}

          {activeTab === "forecast" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="p-4 sm:p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-xl shadow-xl shadow-black/[0.02]">
                <div className="mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                    5-Day Forecast
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Daily weather overview for{" "}
                    <span className="text-foreground font-semibold">{city}</span>
                  </p>
                </div>
                <ForecastList
                  days={forecast.data?.daily}
                  unit={unit}
                  isLoading={forecast.isLoading}
                />
              </div>

              <div className="p-3.5 sm:p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-xl shadow-xl shadow-black/[0.02] overflow-hidden">
                <WeatherChart
                  data={forecast.data?.hourly}
                  unit={unit}
                  isLoading={forecast.isLoading}
                />
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-xl shadow-xl shadow-black/[0.02] overflow-hidden">
              <MLPrediction
                data={prediction.data}
                unit={unit}
                isLoading={prediction.isLoading}
              />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto border-t py-3.5 px-4 sm:px-6" style={{ background: "var(--card)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--border)" }}>
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center tracking-wide">
          © 2026 SkySense. All rights reserved.
        </p>
      </footer>
    </div>
  )
}