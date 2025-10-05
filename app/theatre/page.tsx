"use client"

import { useRouter } from "next/navigation"
<<<<<<< HEAD
import { ArrowLeft } from "lucide-react"
import { DetectiveChatbot } from "../../components/detective-chatbot"
=======
import { ArrowLeft, Volume2, Camera, Music } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
>>>>>>> main

export default function TheatrePage() {
  const router = useRouter()
  const [clickEffects, setClickEffects] = useState<{[key: string]: boolean}>({})
  const [audioEnabled, setAudioEnabled] = useState(false)

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

  const playPianoSound = () => {
    // Play a pleasant chord progression
    playSound(261.63, 300, 'triangle') // C4
    setTimeout(() => playSound(329.63, 300, 'triangle'), 100) // E4
    setTimeout(() => playSound(392.00, 300, 'triangle'), 200) // G4
  }

  const playCameraSound = () => {
    // Play a camera shutter sound effect (quick ascending tones)
    playSound(800, 50, 'square')
    setTimeout(() => playSound(1000, 50, 'square'), 30)
    setTimeout(() => playSound(1200, 50, 'square'), 60)
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

  const handleImageClick = async (imageName: string) => {
    // Resume audio context on first user interaction
    if (!audioEnabled) {
      await resumeAudioContext()
    }

    setClickEffects(prev => ({ ...prev, [imageName]: true }))
    setTimeout(() => {
      setClickEffects(prev => ({ ...prev, [imageName]: false }))
    }, 1000)

    // Different actions for each clickable element with sound effects
    switch (imageName) {
      case 'piano':
        console.log('🎹 Piano clicked - playing melody!')
        playPianoSound()
        break
      case 'security-camera':
        console.log('📹 Security camera clicked - accessing surveillance!')
        playCameraSound()
        break
      case 'stage':
        console.log('🎭 Stage clicked - curtain call!')
        playSound(220, 150) // Generic click sound
        break
    }
  }

  return (
    <div className="min-h-screen theatre-gradient relative overflow-hidden">
      <button
        onClick={() => router.push("/")}
        className="fixed top-8 left-8 glass rounded-2xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Weather</span>
      </button>

      {/* Interactive Canvas Layer */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {/* Background Stage Layer - Non-interactive */}
        <div className="absolute inset-0">
          <Image
            src="/stage-2.PNG"
            alt="Theatre Stage Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Piano Layer - 3x Bigger */}
        <div
          className={`absolute bottom-1/8 left-1/2 -translate-x-1/2 w-[1152px] h-[768px] cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 ${clickEffects['piano'] ? '' : ''}`}
          onClick={() => handleImageClick('piano')}
        >
          <Image
            src="/piano.PNG"
            alt="Grand Piano"
            width={1152}
            height={768}
            className="object-contain drop-shadow-2xl"
          />
          {clickEffects['piano'] && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white text-sm">
              <Music className="w-4 h-4" />
              <span>♪ Playing piano melody...</span>
            </div>
          )}
        </div>

        {/* Security Camera Layer */}
        <div
          className={`absolute top-32 left-16 w-32 h-32 cursor-pointer transition-all duration-300 hover:scale-110 ${clickEffects['security-camera'] ? 'animate-pulse' : ''}`}
          onClick={() => handleImageClick('security-camera')}
        >
          <Image
            src="/security Camera.PNG"
            alt="Security Camera"
            width={3840}
            height={3840}
            className="object-contain"
          />
          {clickEffects['security-camera'] && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white text-xs">
              <Camera className="w-3 h-3" />
              <span>Recording...</span>
            </div>
          )}
        </div>

      </div>

      {/* Interactive Legend */}
      <div className="fixed bottom-8 right-8 glass rounded-2xl p-4 text-white text-sm space-y-2">
        <h3 className="font-semibold mb-2">Interactive Elements:</h3>
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4" />
          <span>Piano - Click to play</span>
        </div>
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4" />
          <span>Camera - Click to record</span>
        </div>

        {/* Audio Status Indicator */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className={`flex items-center gap-2 text-xs ${audioEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
            <Volume2 className={`w-3 h-3 ${audioEnabled ? '' : 'animate-pulse'}`} />
            <span>{audioEnabled ? 'Audio Enabled' : 'Click any element to enable sound'}</span>
          </div>
        </div>
      </div>
      
      {/* Detective Chatbot */}
      <DetectiveChatbot />
    </div>
  )
}
