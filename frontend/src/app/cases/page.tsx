'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getUser, logout } from '@/utils/auth'

export default function CasesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    } else {
      setUser(getUser())
      setAuthChecked(true)
    }
  }, [router])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚖️</div>
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-300 hover:text-amber-200 transition">Home</a>
              <a href="/lawyers" className="text-gray-300 hover:text-amber-200 transition">Lawyer Directory</a>
              <a href="/cases" className="text-amber-200 font-semibold">My Cases</a>
              <a href="/tracker" className="text-gray-300 hover:text-amber-200 transition">Track Case</a>
            </nav>
            {user && (
              <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-amber-200">{user.name || user.email}</p>
                  <p className="text-xs text-gray-400">Logged in</p>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-lg text-sm text-red-200 hover:bg-red-500/30 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              My Cases
            </h2>
            <p className="text-xl text-gray-300">
              View and manage your legal cases
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
            <div className="text-5xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-amber-200 mb-3">Coming Soon</h3>
            <p className="text-gray-400 mb-6">
              This feature is under development. You'll be able to:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-300">
              <li>✅ View all your cases</li>
              <li>✅ Track case status and updates</li>
              <li>✅ Upload documents and evidence</li>
              <li>✅ Communicate with your lawyer</li>
              <li>✅ Receive hearing notifications</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
