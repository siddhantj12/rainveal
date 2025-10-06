"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Volume2, Camera, Music } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { DetectiveChatbot } from "../../components/detective-chatbot"

export default function TheatrePage() {
  const router = useRouter()
  const [clickEffects, setClickEffects] = useState<{[key: string]: boolean}>({})
  const [audioEnabled, setAudioEnabled] = useState(false)
  const backgroundMusicRef = useRef<{oscillator: OscillatorNode, gainNode: GainNode} | null>(null)
  const [showGreeting, setShowGreeting] = useState(false)

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
        playSoundInternal(frequency, duration, type)
      })
      return
    }

    playSoundInternal(frequency, duration, type)
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

      // VERY HIGH volume for audibility - increased from 1.0 to help with quiet systems
      gainNode.gain.setValueAtTime(0.8, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.5, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
      console.log('🔊 Playing sound:', frequency, 'Hz for', duration, 'ms', '- Volume: 0.8')
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

  const playAhaSound = () => {
    // Play an "AHA!" exclamation sound - rising triumphant notes
    playSound(392, 100, 'triangle') // G4
    setTimeout(() => playSound(523.25, 150, 'triangle'), 80) // C5
    setTimeout(() => playSound(659.25, 200, 'triangle'), 160) // E5
    setTimeout(() => playSound(783.99, 300, 'sine'), 240) // G5 - triumphant!
  }

  // Mysterious detective/noir background music track
  const playBackgroundMusic = () => {
    const audioContext = getAudioContext()
    if (!audioContext) {
      console.log('Cannot play background music: no audio context')
      return
    }
    
    if (audioContext.state !== 'running') {
      console.log('Audio context not running, cannot play background music')
      return
    }

    // Stop any existing background music
    stopBackgroundMusic()

    try {
      // Create a mysterious noir-style atmosphere with multiple layers
      const masterGain = audioContext.createGain()
      masterGain.connect(audioContext.destination)
      masterGain.gain.setValueAtTime(0.4, audioContext.currentTime) // Increased from 0.2 to 0.4

      const oscillators: OscillatorNode[] = []

      // Layer 1: Deep bass drone (creates tension)
      const bass = audioContext.createOscillator()
      const bassGain = audioContext.createGain()
      bass.type = 'sine'
      bass.frequency.setValueAtTime(55, audioContext.currentTime) // A1 - deep bass
      bassGain.gain.setValueAtTime(0.3, audioContext.currentTime)
      bass.connect(bassGain)
      bassGain.connect(masterGain)
      bass.start()
      oscillators.push(bass)

      // Layer 2: Minor chord pad (mysterious harmony)
      // A minor chord: A, C, E
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
      oscillators.push(pad1, pad2, pad3)

      // Layer 3: Subtle high shimmer (adds eeriness)
      const shimmer = audioContext.createOscillator()
      const shimmerGain = audioContext.createGain()
      shimmer.type = 'triangle'
      shimmer.frequency.setValueAtTime(1760, audioContext.currentTime) // A6 - very high
      shimmerGain.gain.setValueAtTime(0.05, audioContext.currentTime)
      shimmer.connect(shimmerGain)
      shimmerGain.connect(masterGain)
      shimmer.start()
      oscillators.push(shimmer)

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
      
      console.log('Mysterious detective music started')
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
        // Navigate to security room after brief delay for sound effect
        setTimeout(() => {
          router.push('/security-room')
        }, 300)
        break
      case 'stage':
        console.log('🎭 Stage clicked - curtain call!')
        playSound(220, 150) // Generic click sound
        break
    }
  }

  // Start background music and show detective greeting when entering the theatre
  useEffect(() => {
    // Check if user has already seen the greeting
    const hasSeenGreeting = sessionStorage.getItem('theatre-greeting-shown')
    
    // Show detective greeting only on first visit from weather app
    if (!hasSeenGreeting) {
      const greetingTimer = setTimeout(async () => {
        setShowGreeting(true)
        sessionStorage.setItem('theatre-greeting-shown', 'true')
        
        // Try to play AHA sound - will work if user has interacted
        const audioContext = getAudioContext()
        if (audioContext) {
          // Resume audio context if needed
          if (audioContext.state === 'suspended') {
            try {
              await audioContext.resume()
              console.log('Audio context resumed for AHA sound')
            } catch (error) {
              console.log('Could not resume audio context for AHA:', error)
            }
          }
          
          // Play AHA sound
          if (audioContext.state === 'running') {
            console.log('Playing AHA sound')
            playAhaSound()
          } else {
            console.log('Audio context not running, AHA sound skipped')
          }
        }
      }, 1500)

      // Cleanup greeting timer
      return () => {
        clearTimeout(greetingTimer)
      }
    }
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
      
      if (!audioContext) {
        console.log('No audio context available')
        return
      }

      try {
        if (audioContext.state === 'suspended') {
          console.log('Resuming audio context...')
          await audioContext.resume()
        }
        
        console.log('Audio context state:', audioContext.state)
        setAudioEnabled(true)
        
        // If greeting is showing, play AHA sound now
        if (showGreeting) {
          console.log('Playing AHA sound after user interaction')
          playAhaSound()
        }
        
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
  }, [showGreeting])

  return (
    <div className="min-h-screen theatre-gradient relative overflow-hidden">
      <button
        onClick={() => router.push("/")}
        className="fixed top-4 left-4 sm:top-8 sm:left-8 glass rounded-2xl px-3 sm:px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 z-50 touch-target"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">Back to Weather</span>
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
              className={`absolute top-1/4 left-1/4 w-64 h-64 cursor-pointer transition-all duration-500 hover:scale-105 z-10 ${
                revealedBrokenImages.has(1) ? 'opacity-100' : 'opacity-0'
              } ${isShaking ? 'animate-bounce' : ''}`}
              onClick={() => handleBrokenImageClick(1)}
            >
              <Image
                src="/Broken 1.PNG"
                alt="Broken Clue 1"
                width={256}
                height={256}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Broken Image 2 */}
            <div
              className={`absolute top-1/3 right-1/4 w-64 h-64 cursor-pointer transition-all duration-500 hover:scale-105 z-10 ${
                revealedBrokenImages.has(2) ? 'opacity-100' : 'opacity-0'
              } ${isShaking ? 'animate-spin' : ''}`}
              onClick={() => handleBrokenImageClick(2)}
            >
              <Image
                src="/Broken 2.PNG"
                alt="Broken Clue 2"
                width={256}
                height={256}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Broken Image 3 */}
            <div
              className={`absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 cursor-pointer transition-all duration-500 hover:scale-105 z-10 ${
                revealedBrokenImages.has(3) ? 'opacity-100' : 'opacity-0'
              } ${isShaking ? 'animate-pulse' : ''}`}
              onClick={() => handleBrokenImageClick(3)}
            >
              <Image
                src="/Broken 3.PNG"
                alt="Broken Clue 3"
                width={256}
                height={256}
                className="object-contain w-full h-full"
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
          className={`absolute top-16 left-4 sm:top-32 sm:left-16 w-16 h-16 sm:w-32 sm:h-32 cursor-pointer transition-all duration-300 hover:scale-110 touch-target ${clickEffects['security-camera'] ? 'animate-pulse' : ''}`}
          onClick={() => handleImageClick('security-camera')}
        >
          <Image
            src="/camerafixed.PNG"
            alt="Security Camera"
            width={3840}
            height={3840}
            className="object-contain"
          />
          {clickEffects['security-camera'] && (
            <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 text-white text-xs">
              <Camera className="w-2 h-2 sm:w-3 sm:h-3" />
              <span className="text-xs">Recording...</span>
            </div>
          )}
        </div>

      </div>

      <div className="mt-8 sm:mt-12 text-center relative px-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 text-balance">
          {showPianoBackground ? "🎹 Piano Mystery Unlocked!" : "Welcome to the Theatre"}
        </h1>
        <p className="text-white/80 text-sm sm:text-lg">
          {showPianoBackground
            ? `Clues revealed: ${revealedBrokenImages.size}/3. Click the hidden images in sequence!`
            : "You found the secret performance hall!"
          }
        </p>

        {/* Sequence Progress Indicator */}
        {showPianoBackground && (
          <div className="mt-3 sm:mt-4 flex justify-center gap-1 sm:gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
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


      {/* Detective Greeting Popup */}
      {showGreeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="glass rounded-3xl p-4 sm:p-8 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="text-4xl sm:text-6xl">🕵️</div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">AHA!</h2>
                <p className="text-lg sm:text-xl text-white/90">Welcome, Detective!</p>
              </div>
            </div>
            <div className="text-white/80 space-y-2 text-sm sm:text-base">
              <p>I'm <strong className="text-white">Inspector Gemini</strong>, and I need your help!</p>
              <p>Something mysterious is happening in this theatre...</p>
              <p className="text-xs sm:text-sm text-white/60 mt-3 sm:mt-4">
                💡 Click around to investigate, and chat with me if you need assistance!
              </p>
            </div>
            <button
              onClick={() => setShowGreeting(false)}
              className="mt-3 sm:mt-4 w-full bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-white transition-all duration-300 touch-target"
            >
              Let's solve this mystery! 🔍
            </button>
          </div>
        </div>
      )}

      {/* Detective Chatbot - Now integrated into the theatre scene */}
      <DetectiveChatbot />
    </div>
  )
}
