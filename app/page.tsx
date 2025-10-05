import { WeatherDashboard } from "@/components/weather-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 weather-gradient" />

      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />

      <WeatherDashboard />
    </main>
  )
}
