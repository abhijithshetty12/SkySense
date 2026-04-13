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
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { city, unit } = useWeatherStore()
  const { theme, setTheme } = useTheme()

  const weather = useCurrentWeather(unit)
  const forecast = useForecast(unit)
  const prediction = useMLPrediction(unit)

  const isLoading = weather.isLoading

  const [activeTab, setActiveTab] = useState<"overview" | "forecast" | "ai">("overview")

  // Show error toasts
  useEffect(() => {
    if (weather.error) {
      const msg =
        weather.error instanceof Error
          ? weather.error.message
          : "Failed to fetch weather"
      toast.error(`Weather error: ${msg}`)
    }
  }, [weather.error])

  // Listen for city changes from SearchBar
  useEffect(() => {
    const handleCityChange = () => {
      weather.refetch()
      forecast.refetch()
      prediction.refetch()
    }
    
    window.addEventListener('weather-city-changed', handleCityChange)
    return () => window.removeEventListener('weather-city-changed', handleCityChange)
  }, [weather, forecast, prediction])

  const generateTabs = (activeTab: "overview" | "forecast" | "ai", setActiveTab: React.Dispatch<React.SetStateAction<"overview" | "forecast" | "ai">>, tabValues: ("overview" | "forecast" | "ai")[], tabLabels: string[], tabStyles: string[]) => {
  return tabValues.map((value, index) => (
    <TabsTrigger 
      key={value}
      value={value} 
      className={`h-9 sm:h-10 md:h-auto flex-1 py-1.5 data-[state=active]:shadow-[0_0_0_2px_var(--primary)] ${activeTab === value ? "bg-primary border-primary shadow-primary" : ""} ${tabStyles[index]}`}
    >
      {tabLabels[index]}
    </TabsTrigger>
  ));
};

  const handleRefresh = async () => {
    await Promise.all([
      weather.refetch(),
      forecast.refetch(),
      prediction.refetch(),
    ])
    toast.success("Data refreshed")
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>

      {/* Liquid background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)", opacity: 0.12, filter: "blur(40px)", animation: "float 8s ease-in-out infinite" }} />
        <div className="absolute top-1/3 -left-32 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)", opacity: 0.1, filter: "blur(32px)", animation: "float 10s ease-in-out infinite reverse" }} />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, var(--cyan), transparent 70%)", opacity: 0.08, filter: "blur(28px)", animation: "float 12s ease-in-out infinite" }} />
      </div>

      {/* Top Nav */}
      <header
        className="sticky top-0 z-40 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 px-4 py-3 sm:px-6 sm:py-2.5 overflow-visible"
        style={{ 
          background: "var(--card)", 
          backdropFilter: "blur(24px) saturate(180%)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <img 
            src="/SkySense-Icon.jpg" 
            alt="SkySense" 
            className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg object-cover"
            style={{ background: "rgba(192,192,192,0.15)" }}
          />
          <span className="font-semibold text-base sm:text-sm tracking-tight text-foreground">
            SkySense
          </span>
        </div>

        <Separator orientation="vertical" className="h-5 hidden sm:block mx-2" />

        <div className="w-full sm:flex-1 sm:ml-auto">
          <SearchBar isLoading={isLoading} />
        </div>

        <div className="flex gap-1.5 mt-1 sm:mt-0 sm:gap-1 sm:ml-auto justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="shrink-0 h-9 w-9"
          >
            <RefreshCw
              className={cn("w-4 h-4", isLoading ? "animate-spin" : "")}
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="shrink-0 h-9 w-9"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6 sm:space-y-7">

          {/* Page heading */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="text-xs label-meta">Weather Dashboard</span>
          </div>

          {/* Standalone toggle header */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mt-1 md:mt-0 flex flex-col md:flex-row justify-center md:justify-start gap-1 sm:gap-0.5 text-sm sm:text-xs px-2 sm:px-1 py-1.5 sm:py-1 rounded-md sm:rounded-none" style={{ background: "var(--card)", backdropFilter: "blur(16px)", border: "1px solid var(--border)" }}>
              {generateTabs(activeTab, setActiveTab, ["overview", "forecast", "ai"], ["Overview", "Forecast", "AI Prediction"], ["", "", ""])}

            </TabsList>
          </Tabs>

          {/* Static tab contents - show/hide via activeTab */}
          {activeTab === "overview" && (
            <div className="space-y-5 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-3 lg:gap-5">
                {/* Left: current weather */}
                <div className="lg:col-span-1">
                  <CurrentWeather
                    data={weather.data}
                    unit={unit}
                    isLoading={isLoading}
                  />
                </div>
                {/* Right: stats */}
                <div className="lg:col-span-2">
                  <WeatherStats
                    data={weather.data}
                    unit={unit}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              {/* Chart */}
              <WeatherChart
                data={forecast.data?.hourly}
                unit={unit}
                isLoading={forecast.isLoading}
              />
            </div>
          )}

          {activeTab === "forecast" && (
            <div className="space-y-5 mt-0">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  5-Day Forecast
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Daily weather overview for{" "}
                  <span className="text-foreground font-medium">{city}</span>
                </p>
                <ForecastList
                  days={forecast.data?.daily}
                  unit={unit}
                  isLoading={forecast.isLoading}
                />
              </div>

              {/* Chart in forecast tab too */}
              <WeatherChart
                data={forecast.data?.hourly}
                unit={unit}
                isLoading={forecast.isLoading}
              />
            </div>
          )}

          {activeTab === "ai" && (
            <div className="mt-0">
              <MLPrediction
                data={prediction.data}
                unit={unit}
                isLoading={prediction.isLoading}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 sm:py-3 px-4 sm:px-6" style={{ background: "var(--card)", backdropFilter: "blur(16px)", borderTop: "1px solid var(--border)" }}>
        <p className="text-xs text-muted-foreground text-center">
          © 2024 SkySense. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
