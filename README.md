# 🌦️ Weather Theatre App

*Interactive weather application with hidden theatre experience and immersive audio*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/siddhantj12s-projects/v0-weather-app-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/MsdEE76LdPi)

## ✨ Features

- **🌤️ Interactive Weather Dashboard**: Real-time weather data with beautiful visualizations
- **🎭 Secret Theatre Experience**: Hidden interactive theatre with animated curtains
- **🔊 Immersive Audio System**: Contextual sound effects using Web Audio API
- **📱 Responsive Design**: Works perfectly on all devices
- **⚡ Modern Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS

## 🎵 Audio Features

- **Piano Sounds**: Musical chord progressions when clicking the piano
- **Camera Effects**: Mechanical shutter sounds for the security camera
- **Curtains**: Dramatic opening soundscapes with rumble and swish effects
- **Rain Effects**: Gentle rainfall audio when the cloud triggers rain

## 🎭 Secret Features

- **Hidden Cloud**: Click the roaming cloud icon to trigger rain and theatre transition
- **Interactive Piano**: Massive 3x size piano with real sound effects
- **Giant Camera**: 20x image size with tiny clickable area for precision interaction
- **Theatre Curtains**: Dramatic horizontal curtain opening animation

## 🚀 Deployment

**Live at:** [https://vercel.com/siddhantj12s-projects/v0-weather-app-design](https://vercel.com/siddhantj12s-projects/v0-weather-app-design)

### Deployment Configuration
- ✅ Optimized Next.js build configuration
- ✅ Static page generation for performance
- ✅ API routes for weather data and AI chat
- ✅ Proper security headers
- ✅ Audio context handling for sound effects
- ✅ Vercel.json configuration for optimal deployment

### Environment Variables Setup

**Required for Chatbot Functionality:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key for Gemini API
3. In your **Vercel Dashboard**:
   - Go to your project → Settings → Environment Variables
   - Add environment variable: `GEMINI_API_KEY`
   - Set the value to your API key
   - Ensure it's set for all environments (Production, Preview, Development)

**⚠️ Important Notes:**
- Environment variables are configured in **Vercel Dashboard**, not in `vercel.json`
- The chatbot will show "Inspector Gemini is currently offline" if no API key is configured
- All other features (weather, audio, theatre animations) work without the API key

## 💻 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom animations
- **Audio**: Web Audio API for programmatic sound generation
- **Weather API**: Open-Meteo free weather service
- **Deployment**: Vercel with optimized configuration

## 🎮 User Experience

1. **Weather Dashboard**: View current weather with interactive elements
2. **Secret Discovery**: Find and click the hidden roaming cloud
3. **Rain Transition**: Watch the rain animation with audio effects
4. **Curtain Opening**: Experience the dramatic theatre curtain transition
5. **Theatre Exploration**: Interact with the massive piano and camera in the theatre

Built with ❤️ using cutting-edge web technologies for an immersive audio-visual experience!
