"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Volume2, Camera, Music } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { DetectiveChatbot } from "../../components/detective-chatbot"

export default function TheatrePage() {
  const router = useRouter()
  const [clickEffects, setClickEffects] = useState<{[key: string]: boolean}>({})
  const [audioEnabled, setAudioEnabled] = useState(false)

  // Piano mystery sequence state
  const [showPianoBackground, setShowPianoBackground] = useState(false)
  const [revealedBrokenImages, setRevealedBrokenImages] = useState<Set<number>>(new Set())
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

  const handleBrokenImageClick = (imageNumber: number) => {
    if (showPianoBackground && !revealedBrokenImages.has(imageNumber)) {
      // Check if this is the next image in sequence
      if (imageNumber === currentSequenceStep + 1) {
        // Reveal this image
        setRevealedBrokenImages(prev => new Set([...prev, imageNumber]))
        setCurrentSequenceStep(imageNumber)

        // Play discovery sound
        playSound(440 + (imageNumber * 100), 300, 'triangle')

        // Trigger shaking animation
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 1000)

        // Check if sequence is complete
        if (imageNumber === 3) {
          // All images revealed - maybe trigger final animation
          setTimeout(() => {
            playSound(523.25, 500, 'sine') // High C note for completion
          }, 500)
        }
      }
    }
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

      {/* Enhanced Theatre Canvas */}
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

        {/* Piano Background (shown after clicking piano) */}
        {showPianoBackground && (
          <div className={`absolute inset-0 transition-opacity duration-1000 ${isShaking ? 'animate-pulse' : ''}`}>
            <Image
              src="/PianoBackground.PNG"
              alt="Piano Mystery Background"
              fill
              className="object-cover"
              priority
            />

            {/* Broken Images - revealed in sequence */}
            {/* Broken Image 1 */}
            <div
              className={`absolute top-1/4 left-1/4 w-48 h-48 cursor-pointer transition-all duration-500 hover:scale-105 z-10 ${
                revealedBrokenImages.has(1) ? 'opacity-100' : 'opacity-0'
              } ${isShaking ? 'animate-bounce' : ''}`}
              onClick={() => handleBrokenImageClick(1)}
            >
              <Image
                src="/Broken 1.PNG"
                alt="Broken Clue 1"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>

            {/* Broken Image 2 */}
            <div
              className={`absolute top-1/3 right-1/4 w-48 h-48 cursor-pointer transition-all duration-500 hover:scale-105 z-10 ${
                revealedBrokenImages.has(2) ? 'opacity-100' : 'opacity-0'
              } ${isShaking ? 'animate-spin' : ''}`}
              onClick={() => handleBrokenImageClick(2)}
            >
              <Image
                src="/Broken 2.PNG"
                alt="Broken Clue 2"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>

            {/* Broken Image 3 */}
            <div
              className={`absolute bottom-1/4 left-1/2 -translate-x-1/2 w-48 h-48 cursor-pointer transition-all duration-500 hover:scale-105 z-10 ${
                revealedBrokenImages.has(3) ? 'opacity-100' : 'opacity-0'
              } ${isShaking ? 'animate-pulse' : ''}`}
              onClick={() => handleBrokenImageClick(3)}
            >
              <Image
                src="/Broken 3.PNG"
                alt="Broken Clue 3"
                width={192}
                height={192}
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Original Piano (shown initially) */}
        {!showPianoBackground && (
          <div className="absolute bottom-1/8 left-1/2 -translate-x-1/2">
            {/* Large visual piano image */}
            <div className="w-[1152px] h-[768px]">
              <Image
                src="/piano.PNG"
                alt="Grand Piano"
                width={1152}
                height={768}
                className="object-contain drop-shadow-2xl w-full h-full"
              />
            </div>

            {/* Small clickable area positioned over the piano */}
            <div
              className="absolute top-1/3 left-1/3 w-[150px] h-[120px] cursor-pointer transition-all duration-300 hover:scale-110 bg-transparent"
              onClick={() => {
              // Simple single click - immediate navigation to piano closeup
              router.push("/piano-closeup")
            }}
            />
          </div>
        )}

        {/* Giant Security Camera - 20x image, tiny click area */}
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

      <div className="mt-12 text-center relative">
        <h1 className="text-4xl font-bold text-white mb-4 text-balance">
          {showPianoBackground ? "🎹 Piano Mystery Unlocked!" : "Welcome to the Theatre"}
        </h1>
        <p className="text-white/80 text-lg">
          {showPianoBackground
            ? `Clues revealed: ${revealedBrokenImages.size}/3. Click the hidden images in sequence!`
            : "You found the secret performance hall!"
          }
        </p>

        {/* Sequence Progress Indicator */}
        {showPianoBackground && (
          <div className="mt-4 flex justify-center gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  revealedBrokenImages.has(num)
                    ? 'bg-green-400 scale-125'
                    : currentSequenceStep + 1 >= num
                      ? 'bg-yellow-400 animate-pulse'
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

      {/* Detective Chatbot - Now integrated into the theatre scene */}
      <DetectiveChatbot />
    </div>
  )
}
