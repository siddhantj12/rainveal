"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Image from "next/image"

interface ScratchRevealProps {
  width: number
  height: number
  glitchSrc: string
  revealSrc: string
  onComplete?: () => void
  brushRadius?: number
}

export function ScratchReveal({
  width,
  height,
  glitchSrc,
  revealSrc,
  onComplete,
  brushRadius = 20,
}: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const glitchImageRef = useRef<HTMLImageElement | null>(null)

  // Load glitch image
  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.src = glitchSrc
    img.onload = () => {
      glitchImageRef.current = img
      drawGlitchToCanvas()
    }
  }, [glitchSrc])

  const drawGlitchToCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !glitchImageRef.current) return

    canvas.width = width
    canvas.height = height
    ctx.drawImage(glitchImageRef.current, 0, 0, width, height)
  }

  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return 0

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    let clearedPixels = 0

    // Check alpha channel (every 4th value)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) clearedPixels++
    }

    return clearedPixels / (pixels.length / 4)
  }, [])

  const erase = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx || isComplete) return

      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(x, y, brushRadius, 0, Math.PI * 2)
      ctx.fill()

      // Update progress periodically
      const newProgress = calculateProgress()
      setProgress(newProgress)

      if (newProgress >= 0.65 && !isComplete) {
        setIsComplete(true)
        onComplete?.()
      }
    },
    [brushRadius, calculateProgress, isComplete, onComplete]
  )

  const getPointerPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ("touches" in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      }
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    const pos = getPointerPosition(e)
    if (pos) erase(pos.x, pos.y)
  }

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const pos = getPointerPosition(e)
    if (pos) erase(pos.x, pos.y)
  }

  const handlePointerUp = () => {
    setIsDrawing(false)
  }

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      // Erase ~5% on each key press
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx || isComplete) return

      ctx.globalCompositeOperation = "destination-out"
      const steps = 50
      for (let i = 0; i < steps; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, brushRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      const newProgress = calculateProgress()
      setProgress(newProgress)

      if (newProgress >= 0.65 && !isComplete) {
        setIsComplete(true)
        onComplete?.()
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ width, height }}
      role="button"
      aria-label="Glitched CCTV screen - scrub to reveal"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Revealed image (bottom layer) */}
      <div className="absolute inset-0">
        <Image
          src={revealSrc}
          alt="Revealed CCTV still"
          fill
          className="object-cover"
        />
      </div>

      {/* Canvas with glitch overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* Progress indicator */}
      <div className="absolute bottom-2 left-2 glass rounded-lg px-3 py-1.5">
        <span className="text-xs font-mono text-white">
          {Math.round(progress * 100)}% cleaned
        </span>
      </div>

      {/* Instruction hint */}
      {progress === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="glass rounded-xl px-4 py-2 animate-pulse">
            <p className="text-sm text-white font-medium">
              Click & drag to clean
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

