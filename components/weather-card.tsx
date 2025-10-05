import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation, X } from "lucide-react"

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
  const [showCallSheet, setShowCallSheet] = useState(false)
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
    <div className="relative animate-pulse">
      {/* Multiple glow layers for prominence */}
      <div className="absolute inset-0 blur-xl rounded-full bg-yellow-400/60 animate-pulse" />
      <div className="absolute inset-0 blur-lg rounded-full bg-yellow-300/80" />
      <div className="absolute inset-0 blur-md rounded-full bg-yellow-200/90" />
      <div className="relative scale-110">
        {/* @ts-ignore */}
        {icon}
      </div>
    </div>
  ) : icon

  return (
    <>
      <div
        className={`glass rounded-2xl p-6 text-white transition-all duration-300 ${
          uvUnlocked && isUV 
            ? 'hover:bg-yellow-500/20 hover:shadow-[0_0_30px_rgba(250,204,21,0.4)] cursor-pointer ring-2 ring-yellow-400/50' 
            : ''
        }`}
        {...(uvUnlocked && isUV ? { onClick: () => setShowCallSheet(true), role: 'button', 'aria-label': 'Reveal the truth' } : {})}
      >
        <div className="flex items-center gap-2 mb-4 text-white/70">
          {uvIcon}
          <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        </div>
        {CardInner}

        {uvUnlocked && isUV && (
          <div className="text-xs text-yellow-200/90 mt-2 font-semibold animate-pulse">
            ⚠️ Tap the sun to reveal the truth!
          </div>
        )}
      </div>

      {/* Call Sheet Modal */}
      {showCallSheet && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowCallSheet(false)}
        >
          <div
            className="relative bg-amber-50 text-black max-w-2xl w-[90vw] p-8 rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Courier New, monospace' }}
          >
            <button
              onClick={() => setShowCallSheet(false)}
              className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-full transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-4 border-black p-6 space-y-4">
              <div className="text-center border-b-2 border-black pb-4">
                <h2 className="text-3xl font-bold uppercase tracking-wider">CALL SHEET</h2>
                <p className="text-sm mt-1">PRODUCTION: "████████"</p>
                <p className="text-xs text-gray-600">Case #001 - Date: ██/██/████</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>SHOOT DAY:</strong> [TODAY]</div>
                  <div><strong>LOCATION:</strong> Theatre District</div>
                </div>

                <div className="border-t-2 border-dashed border-black pt-3">
                  <strong>SCHEDULED SEQUENCES:</strong>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>Sequence A: "Security Camera Malfunction"</li>
                    <li>Sequence B: "Spotlight Incident" - Theatre</li>
                    <li>Sequence C: "Piano Key Breakdown" (3 takes)</li>
                    <li>Sequence D: "Discovery Moment" - Hidden props</li>
                  </ul>
                </div>

                <div className="border-t-2 border-dashed border-black pt-3">
                  <strong>TALENT & CREW:</strong>
                  <p className="ml-4 mt-2 text-xs">
                    Principal - "The Investigator" (CAST TBD)<br />
                    Director - ████████████<br />
                    Art Director - Set Dressing & Practical Effects<br />
                    Special FX - Weather Control, Atmospheric<br />
                    Props Master - Musical instruments, Documents
                  </p>
                </div>

                <div className="border-t-2 border-dashed border-black pt-3 bg-yellow-100 p-3 -mx-1">
                  <strong className="text-red-600">PRODUCTION NOTES:</strong>
                  <p className="mt-2 text-xs">
                    • All "clues" must be placed before arrival<br />
                    • Timing critical for dramatic effect<br />
                    • Weather simulation: Rain on cue<br />
                    • Piano rigged for controlled breakage<br />
                    • Ensure all marks hit naturally
                  </p>
                  <p className="mt-2 italic text-xs text-gray-700">
                    "Remember: The best performances feel completely real. 
                    Every detail matters. Make them believe."
                  </p>
                </div>

                <div className="text-center pt-4 border-t border-black">
                  <p className="text-xs text-gray-500">
                    CONFIDENTIAL - FOR PRODUCTION USE ONLY
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
