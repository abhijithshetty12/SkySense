import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  LayoutDashboard,
  RefreshCw,
  Sun,
  Moon,
  CloudSun,
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
      const msg = weather.error instanceof Error ? weather.error.message : "Failed to fetch weather"
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-primary/30 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-blue-600/[0.08] dark:bg-blue-500/[0.03] rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[30%] left-[-10%] w-[400px] h-[400px] bg-purple-600/[0.06] dark:bg-purple-500/[0.02] rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-5%] right-[15%] w-[450px] h-[450px] bg-sky-500/[0.06] dark:bg-sky-500/[0.02] rounded-full blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-slate-950/40 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-white/[0.08] shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <CloudSun className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent hidden sm:block">
              SkySense
            </span>
          </div>

          <Separator orientation="vertical" className="h-6 bg-white/[0.08] hidden sm:block" />

          <div className="flex-1 max-w-xl">
            <SearchBar isLoading={isLoading} />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-9 w-9 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all duration-200 text-slate-300 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading ? "animate-spin text-blue-400" : "")} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.08] transition-all duration-200 text-slate-300 hover:text-white"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400/80 font-medium">
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-semibold">Intelligence Deck</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Weather Analytics
            </h1>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-[380px] p-1 bg-white/[0.02] border border-white/[0.06] backdrop-blur-lg rounded-xl h-11">
              <TabsTrigger 
                value="overview" 
                className="rounded-lg text-xs font-bold tracking-wide transition-all data-[state=active]:bg-gradient-to-b data-[state=active]:from-white/[0.08] data-[state=active]:to-white/[0.02] data-[state=active]:border-white/[0.12] data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="forecast" 
                className="rounded-lg text-xs font-bold tracking-wide transition-all data-[state=active]:bg-gradient-to-b data-[state=active]:from-white/[0.08] data-[state=active]:to-white/[0.02] data-[state=active]:border-white/[0.12] data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                Forecast
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-lg text-xs font-bold tracking-wide transition-all data-[state=active]:bg-gradient-to-b data-[state=active]:from-white/[0.08] data-[state=active]:to-white/[0.02] data-[state=active]:border-white/[0.12] data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                AI Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="w-full transition-all duration-300 outline-none">
          {activeTab === "overview" && (
            <div className="space-y-6 dynamic-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                <div className="lg:col-span-1 h-full">
                  <CurrentWeather data={weather.data} unit={unit} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2 h-full">
                  <WeatherStats data={weather.data} unit={unit} isLoading={isLoading} />
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                <WeatherChart data={forecast.data?.hourly} unit={unit} isLoading={forecast.isLoading} />
              </div>
            </div>
          )}

          {activeTab === "forecast" && (
            <div className="space-y-6 dynamic-fade-in">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-white tracking-tight">5-Day Outlook</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Extended visual analysis map for <span className="text-blue-400 font-semibold">{city}</span>
                  </p>
                </div>
                <ForecastList days={forecast.data?.daily} unit={unit} isLoading={forecast.isLoading} />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-xl shadow-black/20">
                <WeatherChart data={forecast.data?.hourly} unit={unit} isLoading={forecast.isLoading} />
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1 backdrop-blur-xl shadow-xl shadow-black/20 dynamic-fade-in">
              <MLPrediction data={prediction.data} unit={unit} isLoading={prediction.isLoading} />
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto border-t border-white/[0.06] bg-slate-950/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-[11px] font-medium text-slate-500 tracking-wider uppercase text-center sm:text-left">
            © 2026 SkySense. Predictive Climate Framework.
          </p>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  )
}