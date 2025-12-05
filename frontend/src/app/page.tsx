'use client'

import { useState } from 'react'

export default function HomePage() {
  const [incidentText, setIncidentText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Justice Scales Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 text-9xl animate-pulse">⚖️</div>
        <div className="absolute top-40 right-20 text-7xl animate-pulse delay-1000">⚖️</div>
        <div className="absolute bottom-20 left-1/4 text-8xl animate-pulse delay-2000">⚖️</div>
        <div className="absolute bottom-40 right-1/3 text-6xl animate-pulse delay-3000">⚖️</div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">⚖️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
                JustiFly
              </h1>
              <p className="text-xs text-gray-400">Justice Takes Flight</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-amber-200 font-semibold">Home</a>
            <a href="/lawyers" className="text-gray-300 hover:text-amber-200 transition">Find Lawyers</a>
            <a href="/cases" className="text-gray-300 hover:text-amber-200 transition">My Cases</a>
            <a href="/tracker" className="text-gray-300 hover:text-amber-200 transition">Track Case</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="text-8xl mb-6 animate-bounce">⚖️</div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent leading-tight">
            Your Rights, Our Mission
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            AI-powered legal assistance for every Indian citizen. Describe your incident,
            understand your rights, and get connected with expert legal help.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-green-400">✓</span>
              <span className="text-gray-200">100% Anonymous</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-green-400">✓</span>
              <span className="text-gray-200">AI-Powered</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-green-400">✓</span>
              <span className="text-gray-200">Free to Use</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-green-400">✓</span>
              <span className="text-gray-200">Expert Lawyers</span>
            </div>
          </div>
        </div>

        {/* Main Input Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold mb-4 text-amber-200">Describe Your Incident</h3>
            <p className="text-gray-300 mb-6">
              Tell us what happened in your own words. Our AI will analyze and provide legal guidance.
            </p>

            <textarea
              value={incidentText}
              onChange={(e) => setIncidentText(e.target.value)}
              placeholder="Example: On 15th January 2024, I received a call from someone claiming to be from my bank. They asked for my OTP and transferred Rs. 50,000 from my account without my permission..."
              className="w-full h-48 p-4 bg-white/10 border-2 border-white/20 rounded-xl focus:border-amber-400 focus:outline-none resize-none text-white placeholder-gray-400 backdrop-blur-sm"
              minLength={50}
              maxLength={5000}
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-400">
                {incidentText.length}/5000 characters {incidentText.length < 50 && '(minimum 50)'}
              </span>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || incidentText.length < 50}
                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isAnalyzing ? (
                  <span className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Analyzing...</span>
                  </span>
                ) : (
                  '⚖️ Analyze with AI'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-amber-200">Legal Analysis</h3>
            <p className="text-gray-300">
              AI identifies applicable IPC, CrPC, IT Act, and other relevant legal sections
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">📍</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-amber-200">Find Jurisdiction</h3>
            <p className="text-gray-300">
              Locate the right police station, court, or authority to report your case
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">👨‍⚖️</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-amber-200">Expert Lawyers</h3>
            <p className="text-gray-300">
              Get matched with experienced lawyers based on case type and success rate
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="text-4xl mb-4">⚖️</div>
          <p className="text-gray-300 mb-2">© 2024 JustiFly - AI Legal Platform. All rights reserved.</p>
          <p className="text-sm text-gray-400">
            This platform provides general legal information. For specific legal advice, please consult a qualified lawyer.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .delay-1000 { animation-delay: 1s; }
        .delay-2000 { animation-delay: 2s; }
        .delay-3000 { animation-delay: 3s; }
      `}</style>
    </div>
  )
}
