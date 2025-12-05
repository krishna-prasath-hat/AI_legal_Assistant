'use client'

import { useState } from 'react'

export default function TrackerPage() {
  const [trackingId, setTrackingId] = useState('')

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
            <a href="/" className="text-gray-300 hover:text-amber-200 transition">Home</a>
            <a href="/lawyers" className="text-gray-300 hover:text-amber-200 transition">Find Lawyers</a>
            <a href="/cases" className="text-gray-300 hover:text-amber-200 transition">My Cases</a>
            <a href="/tracker" className="text-amber-200 font-semibold">Track Case</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Track Your Case
            </h2>
            <p className="text-xl text-gray-300">
              Track FIR status, court hearings, and case updates in real-time
            </p>
          </div>

          {/* Tracking Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-amber-200">Enter Tracking Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Tracking Type</label>
                <select className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white backdrop-blur-sm">
                  <option className="bg-slate-800">FIR Number</option>
                  <option className="bg-slate-800">Case Number</option>
                  <option className="bg-slate-800">CNR Number</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Enter Number</label>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g., FIR-2024-001234 or CNR Number"
                  className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
              <button className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-500/50 transition">
                🔍 Track Status
              </button>
            </div>
          </div>

          {/* Sample Tracking Result */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-amber-200">FIR-2024-001234</h3>
                <p className="text-gray-300">Cyber Crime - Bank Account Hacking</p>
              </div>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-200 font-semibold rounded-full border border-blue-400/30">
                Under Investigation
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-amber-200 mb-4">Case Timeline</h4>

              {[
                {
                  date: "Dec 4, 2024",
                  title: "Investigation in Progress",
                  description: "Cyber forensics team analyzing digital evidence",
                  status: "current"
                },
                {
                  date: "Dec 1, 2024",
                  title: "FIR Registered",
                  description: "Complaint filed at Cyber Crime Police Station, Bangalore",
                  status: "completed"
                },
                {
                  date: "Nov 30, 2024",
                  title: "Initial Complaint",
                  description: "Incident reported on National Cybercrime Portal",
                  status: "completed"
                }
              ].map((event, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-4 h-4 rounded-full mt-1 ${event.status === 'current' ? 'bg-amber-400 ring-4 ring-amber-400/30' : 'bg-green-400'
                    }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-amber-200">{event.title}</span>
                      <span className="text-sm text-gray-400">{event.date}</span>
                    </div>
                    <p className="text-gray-300">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-400/30">
              <h4 className="font-bold text-blue-200 mb-2">📋 Next Steps</h4>
              <ul className="space-y-2 text-blue-100">
                <li>• Submit additional evidence if available</li>
                <li>• Await charge sheet filing (expected within 60 days)</li>
                <li>• Consult with your lawyer for updates</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 border-2 border-white/20 rounded-lg backdrop-blur-sm">
                <div className="font-semibold text-amber-200 mb-1">Investigating Officer</div>
                <div className="text-gray-300">SI Ramesh Kumar</div>
                <div className="text-sm text-gray-400">📞 080-2553-2900</div>
              </div>
              <div className="p-4 bg-white/5 border-2 border-white/20 rounded-lg backdrop-blur-sm">
                <div className="font-semibold text-amber-200 mb-1">Police Station</div>
                <div className="text-gray-300">Cyber Crime PS, Bangalore</div>
                <div className="text-sm text-gray-400">📍 Bangalore, Karnataka</div>
              </div>
            </div>
          </div>

          {/* Helpful Links */}
          <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-amber-200 mb-4">Helpful Resources</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="https://ecourts.gov.in" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 border-2 border-white/20 rounded-lg hover:border-amber-400/50 transition backdrop-blur-sm">
                <div className="font-semibold text-amber-300">eCourts India</div>
                <div className="text-sm text-gray-400">Track court cases online</div>
              </a>
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="p-4 bg-white/5 border-2 border-white/20 rounded-lg hover:border-amber-400/50 transition backdrop-blur-sm">
                <div className="font-semibold text-amber-300">Cybercrime Portal</div>
                <div className="text-sm text-gray-400">Report cybercrime incidents</div>
              </a>
            </div>
          </div>
        </div>
      </section>

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
