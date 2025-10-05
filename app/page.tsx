"use client"

import { WeatherDashboard } from "@/components/weather-dashboard"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Volume2 } from "lucide-react"

export default function Home() {
  const [showCurtains, setShowCurtains] = useState(false)
  const [curtainsOpen, setCurtainsOpen] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const router = useRouter()

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
    } else {
      console.log('No audio context available')
    }
  }

  // Sound effects using Web Audio API
  const playSound = (frequency: number, duration: number = 200, type: OscillatorType = 'sine') => {
    const audioContext = getAudioContext()
    if (!audioContext) {
      console.log('No audio context available')
      return
    }

    if (audioContext.state !== 'running') {
      console.log('Audio context not running, attempting to resume...')
      resumeAudioContext().then(() => {
        if (audioEnabled) {
          playSoundInternal(frequency, duration, type)
        }
      })
      return
    }

    if (audioEnabled) {
      playSoundInternal(frequency, duration, type)
    }
  }

  const playSoundInternal = (frequency: number, duration: number, type: OscillatorType) => {
    try {
      const audioContext = getAudioContext()
      if (!audioContext || audioContext.state !== 'running') {
        console.log('Audio context not ready for playback')
        return
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = type

      // Maximum volume for audibility
      gainNode.gain.setValueAtTime(1.0, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
      console.log('Playing sound:', frequency, 'Hz for', duration, 'ms')
    } catch (error) {
      console.log('Audio playback failed:', error)
    }
  }

  const playCurtainSound = () => {
    // Play a dramatic curtain opening sound (low rumbling with swish)
    playSound(100, 800, 'sawtooth') // Low rumble
    setTimeout(() => playSound(150, 600, 'triangle'), 200) // Swish effect
    setTimeout(() => playSound(80, 1000, 'sine'), 400) // Final flourish
  }

  const playRainSound = () => {
    // Play a gentle rain sound effect (multiple light tones)
    const raindrops = [400, 450, 500, 550, 600, 650]
    raindrops.forEach((freq, index) => {
      setTimeout(() => playSound(freq, 150, 'triangle'), index * 100)
    })
  }

  // Listen for theatre navigation trigger
  useEffect(() => {
    const handleTheatreNavigation = () => {
      // Start fade out of weather app content
      setFadeOut(true)

      setTimeout(() => {
        setShowCurtains(true)
        // Play curtain opening sound
        setTimeout(() => {
          playCurtainSound()
        }, 100)

        setTimeout(() => {
          setCurtainsOpen(true)
          setTimeout(() => {
            router.push("/theatre")
          }, 1500) // Wait for curtains to fully open
        }, 300) // Curtains appear after fade starts
      }, 700) // Total fade + curtain delay
    }

    // Listen for custom events from WeatherDashboard
    window.addEventListener('navigateToTheatre', handleTheatreNavigation)
    window.addEventListener('rainStarted', () => {
      // Resume audio context for first interaction
      if (!audioEnabled) {
        resumeAudioContext()
      }
      // Play rain sound effect
      playRainSound()
    })

    return () => {
      window.removeEventListener('navigateToTheatre', handleTheatreNavigation)
      window.removeEventListener('rainStarted', () => {
        playRainSound()
      })
    }
  }, [router])

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 -z-10 weather-gradient" />

      {/* Weather App Content with Fade Effect */}
      <div className={`transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />

        <WeatherDashboard />
      </div>

      {/* Theatre Curtains Transition */}
      {showCurtains && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Dark overlay for smooth transition */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              curtainsOpen ? 'opacity-0' : 'opacity-60'
            }`}
          />

          {/* Left Curtain */}
          <div
            className={`absolute inset-y-0 left-0 w-1/2 transition-all duration-1500 ease-in-out transform-gpu ${
              curtainsOpen ? '-translate-x-full opacity-100' : 'translate-x-0 opacity-90'
            }`}
            style={{
              backgroundImage: `url('/curtains.PNG')`,
              backgroundPosition: 'right center',
              backgroundSize: 'cover',
              boxShadow: 'inset -20px 0 40px rgba(0, 0, 0, 0.3)'
            }}
          />

          {/* Right Curtain */}
          <div
            className={`absolute inset-y-0 right-0 w-1/2 transition-all duration-1500 ease-in-out transform-gpu ${
              curtainsOpen ? 'translate-x-full opacity-100' : 'translate-x-0 opacity-90'
            }`}
            style={{
              backgroundImage: `url('/curtains.PNG')`,
              backgroundPosition: 'left center',
              backgroundSize: 'cover',
              boxShadow: 'inset 20px 0 40px rgba(0, 0, 0, 0.3)'
            }}
          />
        </div>
      )}

      {/* Audio Controls */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {!audioEnabled && (
          <button
            onClick={() => resumeAudioContext()}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300 hover:scale-110"
            title="Enable Audio"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        )}

        {/* Audio Test Button */}
        <button
          onClick={() => {
            console.log('Testing audio...')
            playSound(440, 500, 'sine') // A4 note
          }}
          className="bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-sm rounded-full p-2 text-white text-xs transition-all duration-300 hover:scale-110"
          title="Test Audio (A4 440Hz)"
        >
          🔊
        </button>
      </div>
    </main>
  )
}
