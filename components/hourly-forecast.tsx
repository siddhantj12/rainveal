import { Cloud, CloudRain, CloudSnow, Sun, CloudDrizzle } from "lucide-react"
import type { HourlyWeather } from "@/lib/types"

interface HourlyForecastProps {
  forecast: HourlyWeather[]
}

export function HourlyForecast({ forecast }: HourlyForecastProps) {
  return (
    <div className="glass rounded-3xl p-6 text-white h-full">
      <h3 className="text-xl font-semibold mb-6 uppercase tracking-wider">12-Hour Forecast</h3>

      <div className="space-y-4">
        {forecast.slice(0, 12).map((hour, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-lg w-16">{hour.time}</span>

            <div className="flex items-center gap-3 flex-1 justify-center">
              {getWeatherIcon(hour.condition)}
              <span className="text-sm text-white/70">{hour.windSpeed}km/h</span>
            </div>

            <span className="text-lg font-medium w-12 text-right">{Math.round(hour.temp)}°</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function getWeatherIcon(condition: string) {
  const iconClass = "w-6 h-6 text-white/90"

  if (condition.includes("rain")) return <CloudRain className={iconClass} />
  if (condition.includes("snow")) return <CloudSnow className={iconClass} />
  if (condition.includes("drizzle")) return <CloudDrizzle className={iconClass} />
  if (condition.includes("cloud")) return <Cloud className={iconClass} />
  return <Sun className={iconClass} />
}
