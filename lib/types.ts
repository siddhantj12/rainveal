export interface WeatherData {
  location: {
    name: string
    country: string
  }
  current: {
    temp: number
    feelsLike: number
    description: string
    precipitation: number
    windSpeed: number
    windDirection: string
    uvIndex: number
    pressure: number
    humidity: number
    sunrise: string
    sunset: string
  }
  hourly: HourlyWeather[]
  daily: DailyWeather[]
}

export interface HourlyWeather {
  time: string
  temp: number
  condition: string
  windSpeed: number
}

export interface DailyWeather {
  day: string
  temp: number
  condition: string
}
