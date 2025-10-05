"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { DetectiveChatbot } from "../../components/detective-chatbot"

export default function TheatrePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen theatre-gradient flex flex-col items-center justify-center p-4">
      <button
        onClick={() => router.push("/")}
        className="fixed top-8 left-8 glass rounded-2xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2 z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Weather</span>
      </button>

      <div className="theatre-stage relative w-full max-w-6xl">
        {/* Stage Lights */}
        <div className="stage-lights absolute -top-20 left-1/2 -translate-x-1/2 flex gap-8 z-10">
          <div className="spotlight" />
          <div className="spotlight" style={{ animationDelay: "0.5s" }} />
          <div className="spotlight" style={{ animationDelay: "1s" }} />
          <div className="spotlight" style={{ animationDelay: "1.5s" }} />
        </div>

        {/* Curtains */}
        <div className="curtain-left" />
        <div className="curtain-right" />

        {/* Stage */}
        <div className="stage-floor relative bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg p-12 shadow-2xl">
          {/* Piano */}
          <div className="piano-container relative mx-auto w-64 h-48">
            <div className="piano-body absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-gradient-to-br from-gray-900 to-black rounded-tl-[100px] shadow-xl">
              <div className="piano-lid absolute -top-8 left-0 w-full h-24 bg-gradient-to-br from-gray-800 to-black rounded-tl-[80px] transform -rotate-12 origin-bottom-left" />
              <div className="piano-keys absolute bottom-4 left-4 right-4 h-12 bg-white rounded flex">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-gray-300 last:border-r-0" />
                ))}
              </div>
            </div>
            <div className="piano-legs absolute bottom-0 left-1/2 -translate-x-1/2 w-56 flex justify-between">
              <div className="w-3 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded" />
              <div className="w-3 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded" />
              <div className="w-3 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded" />
            </div>
            <div className="piano-bench absolute -bottom-8 left-1/2 -translate-x-1/2 w-24 h-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded">
              <div className="absolute -bottom-4 left-2 w-2 h-6 bg-gray-900 rounded" />
              <div className="absolute -bottom-4 right-2 w-2 h-6 bg-gray-900 rounded" />
            </div>
          </div>

          {/* Microphone Stand */}
          <div className="mic-stand absolute bottom-12 right-1/3 w-1 h-32 bg-gray-800">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-700 rounded-full" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-600 rounded-full" />
          </div>
        </div>

        {/* Audience Seats with Inspector Gemini */}
        <div className="audience-seats mt-8 grid grid-cols-7 gap-2 relative">
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} className={`seat w-full h-16 bg-gradient-to-b from-red-700 to-red-900 rounded-t-lg shadow-lg transition-all duration-300 hover:scale-105 ${
              i === 10 ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
            }`} />
          ))}

          {/* Inspector Gemini - positioned in audience */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
            <div className="relative">
              {/* Detective silhouette */}
              <div className="w-12 h-16 bg-gradient-to-b from-gray-800 to-black rounded-t-full shadow-lg"></div>
              {/* Detective head */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-amber-200 to-amber-400 rounded-full shadow-md"></div>
              {/* Detective hat */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-3 bg-gradient-to-b from-gray-700 to-black rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center relative">
        <h1 className="text-4xl font-bold text-white mb-4 text-balance">Welcome to the Theatre</h1>
        <p className="text-white/80 text-lg">You found the secret performance hall!</p>

        {/* Mystery Clue */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="glass rounded-xl p-4 text-center">
            <div className="text-yellow-400 text-sm font-medium mb-2">🎭 Theatre Mystery</div>
            <p className="text-white/90 text-sm">
              Something mysterious is happening in this theatre. Inspector Gemini is here to help you investigate...
            </p>
          </div>
        </div>
      </div>

      {/* Detective Chatbot - Now integrated into the theatre scene */}
      <DetectiveChatbot />
    </div>
  )
}
