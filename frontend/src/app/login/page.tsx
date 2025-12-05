'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        // Store token
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        // Redirect to home
        router.push('/')
      } else {
        const error = await response.json()
        setError(error.detail || 'Authentication failed')
      }
    } catch (err) {
      // Backend not available - use demo mode
      console.log('Backend not available, using demo mode')

      // Create demo user
      const demoUser = {
        id: 'demo-' + Date.now(),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        phone: formData.phone
      }

      // Store demo token and user
      localStorage.setItem('token', 'demo-token-' + Date.now())
      localStorage.setItem('user', JSON.stringify(demoUser))

      // Redirect to home
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 text-9xl animate-pulse">⚖️</div>
        <div className="absolute bottom-20 right-20 text-7xl animate-pulse delay-1000">⚖️</div>
      </div>

      {/* Login/Signup Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-3xl">⚖️</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              JustiFly
            </h1>
            <p className="text-gray-400 text-sm mt-2">Justice Takes Flight</p>
          </div>

          {/* Toggle Login/Signup */}
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${isLogin
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${!isLogin
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white placeholder-gray-400"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white placeholder-gray-400"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white placeholder-gray-400"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white placeholder-gray-400"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-amber-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-amber-200 font-semibold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>

          {/* Guest Access */}
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 text-sm hover:text-amber-200 transition"
            >
              Continue as Guest →
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  )
}
