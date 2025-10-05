import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get("city") || "Vancouver"

  try {
    // First, get coordinates for the city using Open-Meteo's geocoding API
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    )

    if (!geoResponse.ok) {
      throw new Error("Failed to fetch location data")
    }

    const geoData = await geoResponse.json()

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found")
    }

    const { latitude, longitude, name, country } = geoData.results[0]

    // Get weather data from Open-Meteo
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`,
    )

    if (!weatherResponse.ok) {
      throw new Error("Failed to fetch weather data")
    }

    const weatherData = await weatherResponse.json()

    // Format the response
    const formattedData = {
      location: {
        name,
        country,
      },
      current: {
        temp: Math.round(weatherData.current.temperature_2m),
        feelsLike: Math.round(weatherData.current.apparent_temperature),
        description: getWeatherDescription(weatherData.current.weather_code),
        precipitation: weatherData.current.precipitation || 0,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        windDirection: getWindDirection(weatherData.current.wind_direction_10m),
        uvIndex: Math.round(weatherData.current.uv_index || 0),
        pressure: Math.round(weatherData.current.surface_pressure),
        humidity: weatherData.current.relative_humidity_2m,
        sunrise: formatTime(weatherData.daily.sunrise[0]),
        sunset: formatTime(weatherData.daily.sunset[0]),
      },
      hourly: weatherData.hourly.time.slice(0, 24).map((time: string, index: number) => ({
        time: new Date(time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        temp: Math.round(weatherData.hourly.temperature_2m[index]),
        condition: getWeatherCondition(weatherData.hourly.weather_code[index]),
        windSpeed: Math.round(weatherData.hourly.wind_speed_10m[index]),
      })),
      daily: weatherData.daily.time.slice(0, 6).map((date: string, index: number) => ({
        day: getDayName(new Date(date)),
        temp: Math.round(weatherData.daily.temperature_2m_max[index]),
        condition: getWeatherCondition(weatherData.daily.weather_code[index]),
      })),
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("[v0] Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "clear sky",
    1: "mainly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "foggy",
    48: "depositing rime fog",
    51: "light drizzle",
    53: "moderate drizzle",
    55: "dense drizzle",
    61: "slight rain",
    63: "moderate rain",
    65: "heavy rain",
    71: "slight snow",
    73: "moderate snow",
    75: "heavy snow",
    77: "snow grains",
    80: "slight rain showers",
    81: "moderate rain showers",
    82: "violent rain showers",
    85: "slight snow showers",
    86: "heavy snow showers",
    95: "thunderstorm",
    96: "thunderstorm with slight hail",
    99: "thunderstorm with heavy hail",
  }
  return descriptions[code] || "unknown"
}

function getWeatherCondition(code: number): string {
  if (code === 0 || code === 1) return "clear"
  if (code === 2 || code === 3) return "cloud"
  if (code >= 51 && code <= 67) return "rain"
  if (code >= 71 && code <= 77) return "snow"
  if (code >= 80 && code <= 82) return "rain"
  if (code >= 95) return "storm"
  return "cloud"
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" })
}
