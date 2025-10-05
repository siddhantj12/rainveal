"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Volume2, Camera, Music } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { DetectiveChatbot } from "../../components/detective-chatbot"

export default function PianoCloseupPage() {
  const router = useRouter()
  const [clickEffects, setClickEffects] = useState<{[key: string]: boolean}>({})
  const [audioEnabled, setAudioEnabled] = useState(false)

  // Piano mystery sequence state
  const [showPianoBackground, setShowPianoBackground] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const [currentSequenceStep, setCurrentSequenceStep] = useState(0)

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

  // Piano mystery sequence handlers
  const handlePianoClick = () => {
    if (!showPianoBackground) {
      // First click: show piano background
      setShowPianoBackground(true)
      playPianoSound()
      setClickEffects(prev => ({ ...prev, 'piano': true }))
      setTimeout(() => setClickEffects(prev => ({ ...prev, 'piano': false })), 1000)

      // Trigger shaking animation
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 1000)
    }
  }

  // where to click (percent of canvas) - centered on piano key area
  const HOTSPOT = { left: '35%', top: '30%', width: '30%', height: '40%' } // larger area for easier clicking

  // sequential overlay images
  const brokenImgs = [
    '/piano/broken-1.png',
    '/piano/broken-2.png',
    '/piano/broken-3.png',
  ] as const

  // one hotspot that advances 0->1->2->3
  const advanceBreak = async () => {
    console.log('advanceBreak called, current step:', currentSequenceStep)
    if (!audioEnabled) await resumeAudioContext()

    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 250)

    setCurrentSequenceStep(prev => {
      // derive next stage from currentSequenceStep
      const next = Math.min(prev + 1, 3)
      console.log('Advancing from', prev, 'to', next)
      if (next > prev) {
        // sound feedback per stage
        playSound(480 + next * 80, 220, 'triangle')

        // finished at 3 -> store clue / toast / whatever
        if (next === 3) {
          try {
            const found = JSON.parse(localStorage.getItem('case-001:clues') || '[]')
            if (!found.includes('clue_hinge_shadow')) {
              found.push('clue_hinge_shadow')
              localStorage.setItem('case-001:clues', JSON.stringify(found))
            }
          } catch {}
        }
        return next
      }
      return prev
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
        console.log('🎹 Piano clicked - starting mystery sequence!')
        handlePianoClick()
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <button
        onClick={() => router.push("/theatre")}
        className="fixed top-8 left-8 glass rounded-2xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Theatre</span>
      </button>

      {/* Piano Mystery Canvas */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {/* Piano Background (shown after clicking piano) */}
        {showPianoBackground && (
          <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${isShaking ? 'animate-pulse' : ''}`}>
            <Image
              src="/PianoBackground.PNG"
              alt="Piano Mystery Background"
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Background */}
        {showPianoBackground && (
          <div className={`absolute inset-0 transition-opacity duration-700 ${isShaking ? 'animate-pulse' : ''}`}>
            <Image
              src="/piano/piano-background.png"
              alt="Piano Background"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}

        {/* Overlays (auto-stacked by state) */}
        {showPianoBackground && (
          <>
            {currentSequenceStep >= 1 && (
              <Image
                src={brokenImgs[0]}
                alt=""
                fill
                className="absolute inset-0 object-contain pointer-events-none"
                priority
              />
            )}
            {currentSequenceStep >= 2 && (
              <Image
                src={brokenImgs[1]}
                alt=""
                fill
                className="absolute inset-0 object-contain pointer-events-none"
                priority
              />
            )}
            {currentSequenceStep >= 3 && (
              <Image
                src={brokenImgs[2]}
                alt=""
                fill
                className="absolute inset-0 object-contain pointer-events-none"
                priority
              />
            )}

            {/* Single hotspot to advance the break */}
            <button
              aria-label="Press damaged key"
              onClick={advanceBreak}
              className="absolute z-40"
              style={{
                left: HOTSPOT.left,
                top: HOTSPOT.top,
                width: HOTSPOT.width,
                height: HOTSPOT.height,
              }}
            />
          </>
        )}

        {/* Original Piano (shown initially) */}
        {!showPianoBackground && (
          <div
            className={`absolute bottom-1/8 left-1/2 -translate-x-1/2 w-[1152px] h-[768px] cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2 ${clickEffects['piano'] ? '' : ''}`}
            onClick={handlePianoClick}
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
        )}
      </div>

      <div className="mt-12 text-center relative">
        <h1 className="text-4xl font-bold text-white mb-4 text-balance">
          {showPianoBackground ? "🎹 Piano Mystery Unlocked!" : "Interactive Piano Experience"}
        </h1>
        <p className="text-white/80 text-lg">
          {showPianoBackground
            ? `Piano key damage: ${currentSequenceStep}/3. Keep pressing the damaged key!`
            : "Click the piano to begin the mystery sequence!"
          }
        </p>

        {/* Sequence Progress Indicator */}
        {showPianoBackground && (
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSequenceStep >= num
                    ? 'bg-green-400 scale-125'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>

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

      {/* Detective Chatbot */}
      <DetectiveChatbot />
    </div>
  )
}
