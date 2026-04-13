import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Wind,
  Cloudy,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, LucideIcon> = {
  "01d": Sun,
  "01n": Moon,
  "02d": CloudSun,
  "02n": CloudMoon,
  "03d": Cloud,
  "03n": Cloud,
  "04d": Cloudy,
  "04n": Cloudy,
  "09d": CloudDrizzle,
  "09n": CloudDrizzle,
  "10d": CloudRain,
  "10n": CloudRain,
  "11d": CloudLightning,
  "11n": CloudLightning,
  "13d": CloudSnow,
  "13n": CloudSnow,
  "50d": Wind,
  "50n": Wind,
}

const COLOR_MAP: Record<string, string> = {
  "01d": "text-amber-400",
  "01n": "text-slate-300",
  "02d": "text-sky-300",
  "02n": "text-slate-400",
  "03d": "text-slate-400",
  "03n": "text-slate-400",
  "04d": "text-slate-500",
  "04n": "text-slate-500",
  "09d": "text-blue-400",
  "09n": "text-blue-400",
  "10d": "text-sky-400",
  "10n": "text-sky-400",
  "11d": "text-purple-400",
  "11n": "text-purple-400",
  "13d": "text-cyan-200",
  "13n": "text-cyan-200",
  "50d": "text-slate-400",
  "50n": "text-slate-400",
}

interface WeatherIconProps {
  code: string
  size?: number
  className?: string
}

export function WeatherIcon({ code, size = 24, className }: WeatherIconProps) {
  const Icon = ICON_MAP[code] ?? Cloud
  const colorClass = COLOR_MAP[code] ?? "text-sky-400"
  return (
    <Icon
      style={{ width: size, height: size }}
      className={cn(colorClass, className)}
    />
  )
}
