"use client"

import { useState, useEffect } from "react"
import { MapPin, ChevronRight, Droplets, Wind, Sun, Sunrise, Sunset, Gauge, Cloud } from "lucide-react"
import { WeatherCard } from "./weather-card"
import { HourlyForecast } from "./hourly-forecast"
import { DailyForecast } from "./daily-forecast"
import { LocationSearch } from "./location-search"
import type { WeatherData } from "@/lib/types"
import { useRouter } from "next/navigation"

export function WeatherDashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState("Vancouver")
  const [error, setError] = useState<string | null>(null)
  const [cloudClicks, setCloudClicks] = useState(0)
  const [showRoamingCloud, setShowRoamingCloud] = useState(false)
  const [isRaining, setIsRaining] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchWeather(location)
  }, [location])

  const fetchWeather = async (city: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`)

      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()

      if (!data || !data.location || !data.current) {
        throw new Error("Invalid weather data received")
      }

      setWeather(data)
    } catch (error) {
      console.error("[v0] Error fetching weather:", error)
      setError("Unable to load weather data")
    } finally {
      setLoading(false)
    }
  }

  const handleCloudClick = () => {
    setCloudClicks((prev) => prev + 1)
    const messages = [
      "Nice weather we're having!",
      "Every cloud has a silver lining ☁️",
      "You found the secret cloud!",
      "Stop poking the clouds!",
      "The clouds are ticklish!",
    ]
    const message = messages[Math.min(cloudClicks, messages.length - 1)]

    // Show toast-like notification
    const toast = document.createElement("div")
    toast.className =
      "fixed top-4 right-4 glass rounded-2xl px-6 py-3 text-white z-50 animate-in fade-in slide-in-from-top-2"
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.remove()
    }, 2000)

    if (!showRoamingCloud) {
      setShowRoamingCloud(true)
    }
  }

  const handleRoamingCloudClick = () => {
    setIsRaining(true)
    // Play rain sound effect
    window.dispatchEvent(new CustomEvent('rainStarted'))

    setTimeout(() => {
      // Dispatch custom event for curtains transition
      window.dispatchEvent(new CustomEvent('navigateToTheatre'))
    }, 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass rounded-2xl p-8">
          <div className="animate-pulse text-white text-xl">Loading weather data...</div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass rounded-2xl p-8">
          <div className="text-white text-xl">{error || "Unable to load weather data"}</div>
        </div>
      </div>
    )
  }

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {isRaining && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="rain-container">
            {Array.from({ length: 100 }).map((_, i) => (
              <div
                key={i}
                className="rain-drop"
                style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {showRoamingCloud && !isRaining && (
        <button
          onClick={handleRoamingCloudClick}
          className="fixed roaming-cloud z-40 cursor-pointer hover:scale-110 transition-transform touch-target"
          aria-label="Secret roaming cloud"
        >
          <Cloud className="w-16 h-16 sm:w-32 sm:h-32 text-white/60 drop-shadow-lg" />
        </button>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <LocationSearch currentLocation={location} onLocationChange={setLocation} />

        <button
          onClick={handleCloudClick}
          className="glass rounded-2xl px-3 sm:px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 group touch-target w-full sm:w-auto"
          aria-label="Click the cloud"
        >
          <Cloud className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs sm:text-sm">Click me!</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="glass rounded-3xl p-4 sm:p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-base sm:text-lg font-medium">{weather.location.name}</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="mb-4 sm:mb-6">
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-2">{Math.round(weather.current.temp)}°C</h2>
              <p className="text-xl sm:text-3xl font-light mb-2 capitalize">{weather.current.description}</p>
              <p className="text-sm sm:text-lg text-white/80">{currentDate}</p>
              <p className="text-sm sm:text-lg text-white/80">{currentTime}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <WeatherCard
              icon={<Droplets className="w-5 h-5" />}
              title="PRECIPITATION"
              value={`${weather.current.precipitation}mm`}
              subtitle="In last hour"
              description="Based on current conditions"
            />
            <WeatherCard
              icon={<Wind className="w-5 h-5" />}
              title="WIND"
              value={`${Math.round(weather.current.windSpeed)}km/h`}
              subtitle={weather.current.windDirection}
              showCompass
            />
            <WeatherCard
              icon={<Sun className="w-5 h-5" />}
              title="UV INDEX"
              value={weather.current.uvIndex.toString()}
              subtitle={getUVLevel(weather.current.uvIndex)}
              showUVBar
              uvIndex={weather.current.uvIndex}
            />
            <WeatherCard
              icon={<Gauge className="w-5 h-5" />}
              title="PRESSURE"
              value={`${weather.current.pressure}hPa`}
              subtitle="Sea level"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <WeatherCard
              icon={<Sunrise className="w-4 h-4 sm:w-5 sm:h-5" />}
              title="SUNRISE"
              value={weather.current.sunrise}
              subtitle=""
            />
            <WeatherCard
              icon={<Sunset className="w-4 h-4 sm:w-5 sm:h-5" />}
              title="SUNSET"
              value={weather.current.sunset}
              subtitle=""
            />
          </div>

          <DailyForecast forecast={weather.daily} />
        </div>

        <div className="lg:col-span-1">
          <HourlyForecast forecast={weather.hourly} />
        </div>
      </div>
    </div>
  )
}

function getUVLevel(uv: number): string {
  if (uv <= 2) return "Low"
  if (uv <= 5) return "Moderate"
  if (uv <= 7) return "High"
  if (uv <= 10) return "Very High"
  return "Extreme"
}
