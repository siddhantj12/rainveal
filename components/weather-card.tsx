import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "lucide-react"

interface WeatherCardProps {
  icon: ReactNode
  title: string
  value: string
  subtitle: string
  description?: string
  showCompass?: boolean
  showUVBar?: boolean
  uvIndex?: number
}

export function WeatherCard({
  icon,
  title,
  value,
  subtitle,
  description,
  showCompass,
  showUVBar,
  uvIndex = 0,
}: WeatherCardProps) {
  const [uvUnlocked, setUvUnlocked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      setUvUnlocked(localStorage.getItem('rainveal:uv-unlocked') === '1')
    } catch {}
  }, [])

  const isUV = title?.toUpperCase() === 'UV INDEX'

  const CardInner = (
    <div className="space-y-2">
      <div className="text-3xl font-semibold">{value}</div>
      {subtitle && <div className="text-sm text-white/70">{subtitle}</div>}
      {description && <div className="text-xs text-white/60 mt-2">{description}</div>}

      {showCompass && (
        <div className="flex items-center justify-center mt-4">
          <div className="relative w-20 h-20 rounded-full border-2 border-white/30">
            <div className="absolute inset-0 flex items-center justify-center">
              <Navigation className="w-8 h-8 text-white" style={{ transform: "rotate(0deg)" }} />
            </div>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs">N</div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs">S</div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 text-xs">W</div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs">E</div>
          </div>
        </div>
      )}

      {showUVBar && (
        <div className="mt-4">
          <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full"
              style={{ left: `${(uvIndex / 11) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )

  const uvIcon = uvUnlocked && isUV ? (
    <div className="relative">
      <div className="absolute inset-0 blur-sm rounded-full bg-yellow-300/40" />
      <div className="relative">
        {/* @ts-ignore */}
        {icon}
      </div>
    </div>
  ) : icon

  return (
    <div
      className={`glass rounded-2xl p-6 text-white ${uvUnlocked && isUV ? 'hover:bg-white/10 cursor-pointer' : ''}`}
      {...(uvUnlocked && isUV ? { onClick: () => router.push('/piano-scroll/scene/theatre'), role: 'button', 'aria-label': 'Continue the case via UV sun' } : {})}
    >
      <div className="flex items-center gap-2 mb-4 text-white/70">
        {uvIcon}
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      {CardInner}

      {uvUnlocked && isUV && (
        <div className="text-xs text-yellow-200/90 mt-2">Tap the sun to continue</div>
      )}
    </div>
  )
}
