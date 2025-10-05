"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Volume2 } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
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

  // Cracking sound effect using audio files
  const crackingSounds = ["/cracking-bones_1.mp3", "/cracking-bones_2.mp3"]
  const crackingSoundIndex = useRef(0)

  const playBreakingSound = () => {
    try {
      const audio = new Audio(crackingSounds[crackingSoundIndex.current])
      audio.volume = 0.7
      audio.play().catch(() => {})
      
      // Alternate between the two sounds
      crackingSoundIndex.current = (crackingSoundIndex.current + 1) % crackingSounds.length
      
      console.log("💥 CRACK!")
    } catch (error) {
      console.log("Cracking sound failed:", error)
    }
  }

  // Scene state — start revealed (removes extra click)
  const [showPianoBackground] = useState(true)
  const [isShaking, setIsShaking] = useState(false)
  const [currentSequenceStep, setCurrentSequenceStep] = useState(0) // 0..3

  // Click hotspot for broken keys
  const HOTSPOT = { left: "48%", top: "32%", width: "40%", height: "25%" }

  // Piano keys layout (normalized positions for clickable areas)
  const PIANO_KEYS = [
    // White keys (C, D, E, F, G, A, B)
    { x: 0.05, y: 0.45, w: 0.08, h: 0.35, note: 261.63, name: "C4" },
    { x: 0.13, y: 0.45, w: 0.08, h: 0.35, note: 293.66, name: "D4" },
    { x: 0.21, y: 0.45, w: 0.08, h: 0.35, note: 329.63, name: "E4" },
    { x: 0.29, y: 0.45, w: 0.08, h: 0.35, note: 349.23, name: "F4" },
    { x: 0.37, y: 0.45, w: 0.08, h: 0.35, note: 392.00, name: "G4" },
    { x: 0.45, y: 0.45, w: 0.08, h: 0.35, note: 440.00, name: "A4" },
    { x: 0.53, y: 0.45, w: 0.08, h: 0.35, note: 493.88, name: "B4" },
    { x: 0.61, y: 0.45, w: 0.08, h: 0.35, note: 523.25, name: "C5" },
    { x: 0.69, y: 0.45, w: 0.08, h: 0.35, note: 587.33, name: "D5" },
    { x: 0.77, y: 0.45, w: 0.08, h: 0.35, note: 659.25, name: "E5" },
    { x: 0.85, y: 0.45, w: 0.08, h: 0.35, note: 698.46, name: "F5" },
    { x: 0.93, y: 0.45, w: 0.08, h: 0.35, note: 783.99, name: "G5" },
    
    // Black keys (sharps/flats)
    { x: 0.10, y: 0.45, w: 0.05, h: 0.22, note: 277.18, name: "C#4", isBlack: true },
    { x: 0.18, y: 0.45, w: 0.05, h: 0.22, note: 311.13, name: "D#4", isBlack: true },
    { x: 0.34, y: 0.45, w: 0.05, h: 0.22, note: 369.99, name: "F#4", isBlack: true },
    { x: 0.42, y: 0.45, w: 0.05, h: 0.22, note: 415.30, name: "G#4", isBlack: true },
    { x: 0.50, y: 0.45, w: 0.05, h: 0.22, note: 466.16, name: "A#4", isBlack: true },
    { x: 0.66, y: 0.45, w: 0.05, h: 0.22, note: 554.37, name: "C#5", isBlack: true },
    { x: 0.74, y: 0.45, w: 0.05, h: 0.22, note: 622.25, name: "D#5", isBlack: true },
    { x: 0.90, y: 0.45, w: 0.05, h: 0.22, note: 739.99, name: "F#5", isBlack: true },
  ]

  const playPianoKey = (frequency: number) => {
    const ctx = getAudioContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.frequency.value = frequency
      osc.type = "triangle"
      
      // Instant attack
      gain.gain.value = 0.6
      gain.gain.setTargetAtTime(0.01, ctx.currentTime, 0.5)
      
      osc.start()
      osc.stop(ctx.currentTime + 1.5)
    } catch {}
  }

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
        // Play breaking sound effect
        playBreakingSound()
        // Also play the original tone with shorter delay
        setTimeout(() => playSound(480 + next * 80, 220, "triangle"), 50)
        
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
                  width={1248}
                  height={936}
                  className="absolute top-1/2 left-1/2 transform -translate-x-[45%] -translate-y-[48%] rotate-[1deg] object-contain pointer-events-none z-20" 
                  priority 
                />
              )}
              {currentSequenceStep >= 2 && (
                <Image 
                  src={brokenImgs[1]} 
                  alt="" 
                  width={1248}
                  height={936}
                  className="absolute top-1/2 left-1/2 transform -translate-x-[45%] -translate-y-[48%] rotate-[1deg] object-contain pointer-events-none z-20" 
                  priority 
                />
              )}
              {currentSequenceStep >= 3 && (
                <Image 
                  src={brokenImgs[2]} 
                  alt="" 
                  width={1248}
                  height={936}
                  className="absolute top-1/2 left-1/2 transform -translate-x-[45%] -translate-y-[48%] rotate-[1deg] object-contain pointer-events-none z-20" 
                  priority 
                />
              )}

              {/* Piano key buttons (below broken keys layer) */}
              {PIANO_KEYS.map((key, idx) => (
                <button
                  key={idx}
                  aria-label={`Play ${key.name}`}
                  onClick={() => playPianoKey(key.note)}
                  className="absolute z-30"
                  style={{
                    left: `${key.x * 100}%`,
                    top: `${key.y * 100}%`,
                    width: `${key.w * 100}%`,
                    height: `${key.h * 100}%`,
                  }}
                />
              ))}

              {/* Broken key hotspot (on top) */}
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
