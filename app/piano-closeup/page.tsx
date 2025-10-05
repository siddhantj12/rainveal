"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Volume2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { DetectiveChatbot } from "../../components/detective-chatbot"

export default function PianoCloseupPage() {
  const router = useRouter()

  // Audio
  const [audioEnabled, setAudioEnabled] = useState(false)
  const getAudioContext = () => {
    if (typeof window === "undefined") return null
    if (!(window as any).audioContext) {
      try { (window as any).audioContext = new (window.AudioContext || (window as any).webkitAudioContext)() }
      catch { return null }
    }
    return (window as any).audioContext
  }
  const resumeAudioContext = async () => {
    const ctx = getAudioContext()
    if (!ctx) return
    try {
      if (ctx.state === "suspended") await ctx.resume()
      setAudioEnabled(true)
    } catch {}
  }
  const playSound = (frequency: number, duration = 200, type: OscillatorType = "sine") => {
    const ctx = getAudioContext()
    if (!ctx) return
    const go = () => {
      try {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(frequency, ctx.currentTime)
        osc.type = type
        gain.gain.setValueAtTime(1.0, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + duration / 1000)
        osc.start(); osc.stop(ctx.currentTime + duration / 1000)
      } catch {}
    }
    if (ctx.state !== "running") { resumeAudioContext().then(()=>audioEnabled && go()); return }
    if (audioEnabled) go()
  }

  // Scene state — start revealed (removes extra click)
  const [showPianoBackground] = useState(true)
  const [isShaking, setIsShaking] = useState(false)
  const [currentSequenceStep, setCurrentSequenceStep] = useState(0) // 0..3

  // Click hotspot (percent of canvas) — tweak if needed
  const HOTSPOT = { left: "35%", top: "30%", width: "30%", height: "40%" }

  // Progressive overlays (transparent PNGs)
  const brokenImgs = [
    "/piano/broken-1.png",
    "/piano/broken-2.png",
    "/piano/broken-3.png",
  ] as const

  // Advance 0->1->2->3, store clue at final
  const advanceBreak = async () => {
    if (!audioEnabled) await resumeAudioContext()
    setIsShaking(true); setTimeout(()=>setIsShaking(false), 250)
    setCurrentSequenceStep(prev => {
      const next = Math.min(prev + 1, 3)
      if (next > prev) {
        playSound(480 + next * 80, 220, "triangle")
        if (next === 3) {
          try {
            const found = JSON.parse(localStorage.getItem("case-001:clues") || "[]")
            if (!found.includes("clue_hinge_shadow")) {
              found.push("clue_hinge_shadow")
              localStorage.setItem("case-001:clues", JSON.stringify(found))
            }
          } catch {}
        }
      }
      return next
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <button
        onClick={() => router.push("/theatre")}
        className="fixed top-8 left-8 glass rounded-2xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Theatre</span>
      </button>

      {/* Canvas */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {/* Piano interaction area - establishes positioning context */}
        <div className="relative w-full h-full">
          {/* Single background (no splash, no duplicate) */}
          {showPianoBackground && (
            <Image
              src="/piano/piano-background.png"
              alt="Piano Background"
              fill
              className={`absolute inset-0 object-cover transition-opacity duration-700 ${isShaking ? "animate-pulse" : ""}`}
              priority
            />
          )}

          {/* Overlays by state */}
          {showPianoBackground && (
            <>
              {currentSequenceStep >= 1 && (
                <Image 
                  src={brokenImgs[0]} 
                  alt="" 
                  width={800}
                  height={600}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none z-20" 
                  priority 
                />
              )}
              {currentSequenceStep >= 2 && (
                <Image 
                  src={brokenImgs[1]} 
                  alt="" 
                  width={800}
                  height={600}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none z-20" 
                  priority 
                />
              )}
              {currentSequenceStep >= 3 && (
                <Image 
                  src={brokenImgs[2]} 
                  alt="" 
                  width={800}
                  height={600}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none z-20" 
                  priority 
                />
              )}

              {/* Single hotspot to advance the break */}
              <button
                aria-label="Press damaged key"
                onClick={advanceBreak}
                className="absolute z-40"
                style={{ left: HOTSPOT.left, top: HOTSPOT.top, width: HOTSPOT.width, height: HOTSPOT.height }}
              />
            </>
          )}
        </div>
      </div>

      {/* Step indicator */}
      {showPianoBackground && (
        <div className="mt-12 text-center relative">
          <div className="flex justify-center gap-2">
            {[1,2,3].map(n => (
              <div key={n} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSequenceStep >= n ? "bg-green-400 scale-125" : "bg-gray-600"}`} />
            ))}
          </div>
        </div>
      )}


      <DetectiveChatbot />
    </div>
  )
}
