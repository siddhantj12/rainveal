"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Toast } from "@/components/ui/Toast"
import { ArrowLeft } from "lucide-react"

// Hotspot for the rolled note (normalized 0..1 rect)
const ROLLED_NOTE = { x: 0.62, y: 0.62, w: 0.20, h: 0.24 }

export default function PianoNoteScene() {
  const router = useRouter()
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [showOverlay, setShowOverlay] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Track container size for absolute positioning
  useEffect(() => {
    const updateSize = () => {
      const el = document.getElementById("piano-note-container")
      if (el) setContainerSize({ width: el.clientWidth, height: el.clientHeight })
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Close overlay on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowOverlay(false)
      if ((e.key === "Enter" || e.key === " ") && !showOverlay) setShowOverlay(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showOverlay])

  const rolledStyle = useMemo(() => ({
    left: `${ROLLED_NOTE.x * 100}%`,
    top: `${ROLLED_NOTE.y * 100}%`,
    width: `${ROLLED_NOTE.w * 100}%`,
    height: `${ROLLED_NOTE.h * 100}%`,
  }), [])

  const markAsRead = () => {
    try {
      const key = "case-001:clues"
      const clues = JSON.parse(localStorage.getItem(key) || "[]")
      if (!clues.includes("clue_piano_poem")) {
        clues.push("clue_piano_poem")
        localStorage.setItem(key, JSON.stringify(clues))
      }
      localStorage.setItem("rainveal:uv-unlocked", "1")
      localStorage.setItem("case-001:note_poem_read", "1")
      setShowToast(true)
    } catch {}
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      <button
        onClick={() => router.push("/theatre")}
        className="fixed top-8 left-8 glass rounded-2xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Theatre</span>
      </button>

      <div id="piano-note-container" className="relative w-full h-screen">
        {/* Background piano image (with missing key) */}
        <Image
          src="/PianoNoKey.PNG"
          alt="Piano with missing key"
          fill
          priority
          className="object-cover"
        />

        {/* Rolled note hotspot */}
        <button
          className="absolute z-20"
          style={rolledStyle as any}
          onClick={() => setShowOverlay(true)}
          role="button"
          aria-label="Open hidden note"
        />

        {/* Visual rolled note image inside hotspot for alignment aid (kept invisible to clicks) */}
        <div
          className="absolute z-10 pointer-events-none"
          style={rolledStyle as any}
        >
          <Image src="/noteRolledUp.PNG" alt="Rolled note" fill className="object-contain" />
        </div>

        {/* Overlay when note is opened */}
        {showOverlay && (
          <div
            className="absolute inset-0 z-40 flex items-center justify-center"
            onClick={() => setShowOverlay(false)}
          >
            {/* Scrim */}
            <div className="absolute inset-0 bg-black/70" />

            {/* Note content */}
            <div
              className="relative z-50 max-w-3xl w-[92vw] animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full aspect-[3/2]">
                <Image src="/noteOut.PNG" alt="Open note" fill className="object-contain" />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={markAsRead}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-2 transition"
                >
                  Mark as read
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showToast && (
        <Toast
          message="Poem noted. Look for a golden sun…"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}


