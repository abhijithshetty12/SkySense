import { useState, useEffect, useRef } from "react"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { MapPin, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchCitySearchDirect } from "@/lib/api"
import type { CitySearchResult } from "@/types/weather"
import { useWeatherStore } from "@/store/weatherStore"

interface SearchBarProps {
  isLoading?: boolean
}

export function SearchBar({ isLoading }: SearchBarProps) {
  const { city, unit, setCity, setLatLon, setUnit } = useWeatherStore()
  const queryClient = useQueryClient()

  const [searchValue, setSearchValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: cities } = useQuery<CitySearchResult[]>({
    queryKey: ['cities', searchValue],
    queryFn: () => fetchCitySearchDirect(searchValue),
    enabled: searchValue.length > 2,
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const changeCity = (cityResult: CitySearchResult) => {
    queryClient.removeQueries({ queryKey: ['weather'] })
    queryClient.removeQueries({ queryKey: ['forecast'] })
    queryClient.removeQueries({ queryKey: ['predict'] })
    queryClient.removeQueries({ queryKey: ['recommendations'] })
    setCity(cityResult.name, cityResult.lat, cityResult.lon)
    toast.info(`Loading weather for ${cityResult.name}...`)
    setIsOpen(false)
    setSearchValue('')
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 min-w-0 relative">
        <div className="relative" ref={dropdownRef}>
          <div className={cn(
            "h-11 w-full max-w-sm justify-between rounded-2xl border px-4 text-sm flex items-center gap-2 transition-all",
            isOpen ? "rounded-t-lg border-b-0 shadow-lg" : "rounded-2xl",
            isLoading && "animate-pulse"
          )} style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--foreground)"
          }}>
            <MapPin className="size-4 shrink-0" style={{ color: "var(--primary)" }} />
            <input
              className="flex-1 bg-transparent outline-none border-none text-sm placeholder:text-muted-foreground"
              placeholder="Search cities worldwide..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value)
                setIsOpen(e.target.value.length > 2)
              }}
              onFocus={() => setIsOpen(true)}
              disabled={isLoading}
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue('')
                  setIsOpen(false)
                }}
                className="size-6 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
          </div>

          {isOpen && (
            <div
              className="absolute z-50 top-full left-0 right-0 mt-1 max-w-sm w-full max-h-72 overflow-auto rounded-b-2xl border-x border-b shadow-lg backdrop-blur-xl"
              style={{ background: "var(--popover)", borderColor: "var(--border)" }}
            >
              <div className="py-2 max-h-60 overflow-auto">
                {cities?.length ? (
                  cities.slice(0, 8).map((result) => (
                    <button
                      key={`${result.lat}-${result.lon}`}
                      onClick={() => changeCity(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all cursor-pointer hover:bg-accent"
                      style={{ color: "var(--foreground)" }}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <span className="truncate font-medium">{result.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">{result.country}</span>
                        {result.state && <span className="text-xs text-muted-foreground">, {result.state}</span>}
                      </div>
                    </button>
                  ))
                ) : searchValue.length > 2 ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                    No cities found for "{searchValue}"
                  </div>
                ) : (
                  <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                    Type 3+ characters to search...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg border shrink-0 p-1" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all size-fit",
              unit === u
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {u === "metric" ? "°C" : "°F"}
          </button>
        ))}
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-xs shrink-0 font-medium text-orange-600 drop-shadow-sm">
        <MapPin className="w-3 h-3" />
        <span>{city}</span>
      </div>
    </div>
  )
}
