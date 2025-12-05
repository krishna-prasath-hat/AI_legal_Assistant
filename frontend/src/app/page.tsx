'use client'

import { useState } from 'react'

export default function HomePage() {
  const [incidentText, setIncidentText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)

  const handleAnalyze = async () => {
    if (!incidentText.trim() || incidentText.length < 50) {
      alert('Please describe your incident in at least 50 characters')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/legal/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo_token'
        },
        body: JSON.stringify({
          incident_text: incidentText,
          is_anonymous: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Analysis result:', data)
        alert('Analysis complete! Check console for results.')
      } else {
        alert('Analysis failed. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to connect to server')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Calming Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-2xl">⚖️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">JustiFly</h1>
                <p className="text-xs text-gray-500">We're here to help</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-blue-600 font-semibold">Home</a>
              <a href="/lawyers" className="text-gray-600 hover:text-blue-600 transition">Find Lawyers</a>
              <a href="/cases" className="text-gray-600 hover:text-blue-600 transition">My Cases</a>
              <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Login</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Breathing Exercise Banner (if stressed) */}
      {showBreathing && (
        <div className="bg-green-100 border-b-2 border-green-300">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-2xl">🫁</span>
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">Take a Deep Breath</h3>
                  <p className="text-green-700">Breathe in (4s) → Hold (4s) → Breathe out (4s)</p>
                </div>
              </div>
              <button
                onClick={() => setShowBreathing(false)}
                className="text-green-700 hover:text-green-900 font-semibold"
              >
                I'm Ready ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Reassuring Message */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4 px-6 py-3 bg-blue-100 rounded-full">
              <p className="text-blue-800 font-semibold">✓ You're in the right place</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              We're Here to Help You
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              Take a deep breath. You've taken the first step.
            </p>
            <button
              onClick={() => setShowBreathing(true)}
              className="text-green-600 hover:text-green-700 text-sm underline"
            >
              Feeling stressed? Try a breathing exercise
            </button>
          </div>

          {/* Emergency Contacts - Prominent */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-start space-x-3 mb-4">
              <span className="text-3xl">🚨</span>
              <div>
                <h3 className="font-bold text-red-900 text-lg mb-1">In Immediate Danger?</h3>
                <p className="text-red-700 mb-3">Call emergency services first, then we can help with legal guidance</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a href="tel:100" className="bg-white px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 transition text-center">
                <div className="font-bold text-red-600 text-xl">100</div>
                <div className="text-xs text-gray-600">Police</div>
              </a>
              <a href="tel:1091" className="bg-white px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 transition text-center">
                <div className="font-bold text-red-600 text-xl">1091</div>
                <div className="text-xs text-gray-600">Women Helpline</div>
              </a>
              <a href="tel:1930" className="bg-white px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 transition text-center">
                <div className="font-bold text-red-600 text-xl">1930</div>
                <div className="text-xs text-gray-600">Cyber Crime</div>
              </a>
              <a href="tel:1098" className="bg-white px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 transition text-center">
                <div className="font-bold text-red-600 text-xl">1098</div>
                <div className="text-xs text-gray-600">Child Helpline</div>
              </a>
            </div>
          </div>

          {/* Main Input Card - Simplified */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Tell Us What Happened</h3>
              <p className="text-gray-600">
                Don't worry about legal terms. Just describe in your own words.
              </p>
            </div>

            {/* Character Counter - Visual */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Description</span>
                <span className={`text-sm font-semibold ${incidentText.length >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                  {incidentText.length >= 50 ? '✓ Ready' : `${50 - incidentText.length} more characters needed`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all ${incidentText.length >= 50 ? 'bg-green-500' : 'bg-orange-400'}`}
                  style={{ width: `${Math.min((incidentText.length / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <textarea
              value={incidentText}
              onChange={(e) => setIncidentText(e.target.value)}
              placeholder="Example: Someone called me pretending to be from my bank and asked for my OTP. They transferred money from my account..."
              className="w-full h-48 p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-gray-800 placeholder-gray-400 text-lg"
              minLength={50}
              maxLength={5000}
            />

            {/* Large, Clear CTA Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || incidentText.length < 50}
              className="w-full mt-6 py-5 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold text-xl rounded-xl hover:shadow-2xl hover:scale-105 transform transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center space-x-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing Your Situation...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>⚖️</span>
                  <span>Get Legal Guidance Now</span>
                  <span>→</span>
                </span>
              )}
            </button>

            {/* Trust Indicators */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>Free Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>Instant Help</span>
              </div>
            </div>
          </div>

          {/* Simple 3-Step Process */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              How It Works - 3 Simple Steps
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-3xl font-bold">1</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Describe</h4>
                <p className="text-gray-600">Tell us what happened in simple words</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-3xl font-bold">2</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Understand</h4>
                <p className="text-gray-600">Get clear legal guidance instantly</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-3xl font-bold">3</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Act</h4>
                <p className="text-gray-600">Connect with lawyers and take action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-3xl mb-3">⚖️</div>
          <p className="text-gray-300 mb-2">© 2024 JustiFly - AI Legal Assistance Platform</p>
          <p className="text-xs text-gray-400">
            This platform provides general legal information. For specific legal advice, please consult a qualified lawyer.
          </p>
        </div>
      </footer>
    </div>
  )
}
