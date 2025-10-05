"use client"

import { useEffect, useState } from "react"

interface ToastProps {
  message: string
  duration?: number
  onClose?: () => void
}

export function Toast({ message, duration = 2200, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="glass rounded-2xl px-6 py-4 shadow-2xl border border-white/20 max-w-md">
        <p className="text-white font-medium text-center">{message}</p>
      </div>
    </div>
  )
}

