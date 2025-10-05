"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { DetectiveChatbot } from "@/components/detective-chatbot"

// Monitor position (normalized 0..1 relative to background image)
const MONITOR = {
  x: 0.50,
  y: 0.37,
  w: 0.113,
  h: 0.371,
  rotateDeg: -1,
}

export default function SecurityRoomPage() {
  const router = useRouter()
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [showGlitch, setShowGlitch] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const backgroundMusicRef = useRef<{oscillator: OscillatorNode, gainNode: GainNode} | null>(null)

  // Initialize AudioContext
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null

    if (!(window as any).audioContext) {
      try {
        (window as any).audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.log('Web Audio API not supported')
        return null
      }
    }
    return (window as any).audioContext
  }

  // Resume AudioContext (required by browser autoplay policy)
  const resumeAudioContext = async () => {
    const audioContext = getAudioContext()
    if (audioContext) {
      try {
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
          console.log('Audio context resumed successfully')
        }
        setAudioEnabled(true)
        console.log('Audio enabled, context state:', audioContext.state)
      } catch (error) {
        console.log('Could not resume audio context:', error)
      }
    }
  }

  // Sound effects using Web Audio API
  const playSound = (frequency: number, duration: number = 200, type: OscillatorType = 'sine') => {
    const audioContext = getAudioContext()
    if (!audioContext || audioContext.state !== 'running') return

    try {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.8, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.5, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.log('Audio playback failed:', error)
    }
  }

  // Revealing sound effect - ascending glitchy tones
  const playRevealSound = () => {
    playSound(200, 100, 'square') // Low glitch
    setTimeout(() => playSound(400, 120, 'sawtooth'), 80)
    setTimeout(() => playSound(600, 140, 'triangle'), 160)
    setTimeout(() => playSound(800, 160, 'sine'), 240) // High clear tone
  }

  // Rubber ducky squeak sound effect - extra goofy!
  const playDuckySound = () => {
    const audioContext = getAudioContext()
    if (!audioContext || audioContext.state !== 'running') return

    try {
      // Main squeak - exaggerated cartoon-style
      const squeak1 = audioContext.createOscillator()
      const gain1 = audioContext.createGain()

      squeak1.connect(gain1)
      gain1.connect(audioContext.destination)

      // Super exaggerated pitch slide for maximum goofiness
      squeak1.frequency.setValueAtTime(400, audioContext.currentTime)
      squeak1.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.08)
      squeak1.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.25)
      
      squeak1.type = 'sine'

      gain1.gain.setValueAtTime(0.7, audioContext.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25)

      squeak1.start(audioContext.currentTime)
      squeak1.stop(audioContext.currentTime + 0.25)

      // Add a second "bounce" squeak for extra silliness
      const squeak2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()

      squeak2.connect(gain2)
      gain2.connect(audioContext.destination)

      squeak2.frequency.setValueAtTime(600, audioContext.currentTime + 0.15)
      squeak2.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.2)
      squeak2.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3)
      
      squeak2.type = 'sine'

      gain2.gain.setValueAtTime(0.5, audioContext.currentTime + 0.15)
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      squeak2.start(audioContext.currentTime + 0.15)
      squeak2.stop(audioContext.currentTime + 0.3)
      
      console.log('🦆 SQUEAK SQUEAK!')
    } catch (error) {
      console.log('Duck sound failed:', error)
    }
  }

  // Mysterious detective/noir background music track
  const playBackgroundMusic = () => {
    const audioContext = getAudioContext()
    if (!audioContext || audioContext.state !== 'running') return

    // Stop any existing background music
    stopBackgroundMusic()

    try {
      // Create a mysterious noir-style atmosphere with multiple layers
      const masterGain = audioContext.createGain()
      masterGain.connect(audioContext.destination)
      masterGain.gain.setValueAtTime(0.4, audioContext.currentTime)

      // Layer 1: Deep bass drone (creates tension)
      const bass = audioContext.createOscillator()
      const bassGain = audioContext.createGain()
      bass.type = 'sine'
      bass.frequency.setValueAtTime(55, audioContext.currentTime) // A1 - deep bass
      bassGain.gain.setValueAtTime(0.3, audioContext.currentTime)
      bass.connect(bassGain)
      bassGain.connect(masterGain)
      bass.start()

      // Layer 2: Minor chord pad (mysterious harmony)
      const pad1 = audioContext.createOscillator()
      const pad2 = audioContext.createOscillator()
      const pad3 = audioContext.createOscillator()
      const padGain = audioContext.createGain()
      
      pad1.type = 'sine'
      pad2.type = 'sine'
      pad3.type = 'sine'
      
      pad1.frequency.setValueAtTime(220, audioContext.currentTime) // A3
      pad2.frequency.setValueAtTime(261.63, audioContext.currentTime) // C4
      pad3.frequency.setValueAtTime(329.63, audioContext.currentTime) // E4
      
      padGain.gain.setValueAtTime(0.15, audioContext.currentTime)
      
      pad1.connect(padGain)
      pad2.connect(padGain)
      pad3.connect(padGain)
      padGain.connect(masterGain)
      
      pad1.start()
      pad2.start()
      pad3.start()

      // Layer 3: Subtle high shimmer (adds eeriness)
      const shimmer = audioContext.createOscillator()
      const shimmerGain = audioContext.createGain()
      shimmer.type = 'triangle'
      shimmer.frequency.setValueAtTime(1760, audioContext.currentTime) // A6 - very high
      shimmerGain.gain.setValueAtTime(0.05, audioContext.currentTime)
      shimmer.connect(shimmerGain)
      shimmerGain.connect(masterGain)
      shimmer.start()

      // Add slow LFO for breathing effect
      const lfo = audioContext.createOscillator()
      const lfoGain = audioContext.createGain()
      lfo.frequency.value = 0.15 // Very slow breathing effect
      lfoGain.gain.value = 0.02
      lfo.connect(lfoGain)
      lfoGain.connect(masterGain.gain)
      lfo.start()

      // Store reference for cleanup
      backgroundMusicRef.current = { oscillator: bass, gainNode: masterGain }
      
      console.log('Security room music started')
    } catch (error) {
      console.log('Failed to start background music:', error)
    }
  }

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      try {
        backgroundMusicRef.current.oscillator.stop()
        backgroundMusicRef.current = null
        console.log('Background music stopped')
      } catch (error) {
        console.log('Error stopping background music:', error)
      }
    }
  }

  const handleGlitchClick = async () => {
    // Resume audio context on first user interaction
    if (!audioEnabled) {
      await resumeAudioContext()
    }
    
    playRevealSound()
    setShowGlitch(false)
  }

  const handleGunClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Resume audio context on first user interaction
    if (!audioEnabled) {
      await resumeAudioContext()
    }
    
    playDuckySound()
  }

  // Track container size for responsive monitor positioning
  useEffect(() => {
    const updateSize = () => {
      const container = document.getElementById("security-container")
      if (container) {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Auto-play background music when page loads
  useEffect(() => {
    let audioInitialized = false

    // Enable audio on first user interaction
    const enableAudioOnInteraction = async () => {
      if (audioInitialized) return
      audioInitialized = true

      console.log('Enabling audio...')
      const audioContext = getAudioContext()
      
      if (!audioContext) return

      try {
        if (audioContext.state === 'suspended') {
          console.log('Resuming audio context...')
          await audioContext.resume()
        }
        
        console.log('Audio context state:', audioContext.state)
        setAudioEnabled(true)
        
        // Start background music after enabling audio
        setTimeout(() => {
          console.log('Starting background music...')
          playBackgroundMusic()
        }, 800)
      } catch (error) {
        console.error('Failed to enable audio:', error)
      }
    }

    // Listen for any user interaction to enable audio
    const handleInteraction = () => {
      console.log('User interaction detected')
      enableAudioOnInteraction()
      // Remove listeners after first interaction
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('keydown', handleInteraction)

    // Cleanup: stop music when leaving the page
    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('keydown', handleInteraction)
      stopBackgroundMusic()
    }
  }, [])

  // Calculate monitor dimensions based on container size
  const monitorRect = {
    left: containerSize.width * MONITOR.x,
    top: containerSize.height * MONITOR.y,
    width: containerSize.width * MONITOR.w,
    height: containerSize.height * MONITOR.h,
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Back button */}
      <button
        onClick={() => router.push("/theatre")}
        className="fixed top-8 left-8 glass rounded-2xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Theatre</span>
      </button>

      {/* Security room background */}
      <div
        id="security-container"
        className="relative w-full h-screen flex items-center justify-center"
      >
        <div className="relative w-full h-full">
          <Image
            src="/securityroombg.PNG"
            alt="Security Room"
            fill
            className="object-contain"
            priority
          />

          {/* Easter egg: Clickable gun (rubber ducky sound) */}
          {containerSize.width > 0 && (
            <button
              className="absolute cursor-pointer hover:scale-110 transition-transform duration-200 z-20"
              style={{
                left: `${containerSize.width * 0.435}px`,
                top: `${containerSize.height * 0.655}px`,
                width: `${containerSize.width * 0.055}px`,
                height: `${containerSize.height * 0.065}px`,
              }}
              onClick={handleGunClick}
              aria-label="Mysterious object"
              title="🦆"
            />
          )}

          {/* Left portrait monitor with clickable glitch screen */}
          {containerSize.width > 0 && showGlitch && (
            <div
              className="absolute cursor-pointer transition-opacity duration-500 hover:opacity-90"
              style={{
                left: `${monitorRect.left}px`,
                top: `${monitorRect.top}px`,
                width: `${monitorRect.width}px`,
                height: `${monitorRect.height}px`,
                transform: `rotate(${MONITOR.rotateDeg}deg)`,
                transformOrigin: "center",
              }}
              onClick={handleGlitchClick}
              role="button"
              aria-label="Click to clear glitch"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleGlitchClick()
                }
              }}
            >
              <Image
                src="/glitchScreen.PNG"
                alt="Security Monitor - Click to clear"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Detective Chatbot */}
      <DetectiveChatbot />
    </div>
  )
}

