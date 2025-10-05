import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle } from "lucide-react"
import type { DailyWeather } from "@/lib/types"

interface DailyForecastProps {
  forecast: DailyWeather[]
}

export function DailyForecast({ forecast }: DailyForecastProps) {
  return (
    <div className="glass rounded-3xl p-8 text-white">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
        {forecast.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            {getWeatherIcon(day.condition, "w-12 h-12")}
            <div className="text-center">
              <div className="text-3xl font-semibold">{Math.round(day.temp)}°</div>
              <div className="text-sm text-white/70 mt-1">{day.day}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getWeatherIcon(condition: string, className: string) {
  if (condition.includes("rain")) return <CloudRain className={className} />
  if (condition.includes("snow")) return <CloudSnow className={className} />
  if (condition.includes("drizzle")) return <CloudDrizzle className={className} />
  if (condition.includes("cloud")) return <Cloud className={className} />
  return <Sun className={className} />
}
