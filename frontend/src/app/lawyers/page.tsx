'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getUser, logout } from '@/utils/auth'

/**
 * BCI Rule 36 COMPLIANT Lawyer Directory Page
 * 
 * ✅ Alphabetical sorting only
 * ✅ User-driven filters (practice area, city, language)
 * ✅ Location-based search
 * ✅ Factual information only
 * ✅ Mandatory disclaimer
 * ✅ Authentication required
 * 
 * ❌ NO ratings, rankings, fees, or promotional content
 */

interface LawyerProfile {
  id: string
  full_name: string
  enrollment_number: string
  bar_council_state: string
  enrollment_date: string
  practice_areas: string[]
  courts_practicing_in: string[]
  languages_known: string[]
  city: string
  state: string
  email?: string
  phone?: string
  office_address?: string
  law_degree?: string
  law_school?: string
  profile_verified: boolean
  profile_claimed: boolean
}

interface LocationData {
  city: string
  state: string
  detected: boolean
}

const MANDATORY_DISCLAIMER = `DISCLAIMER: This is a factual directory of advocates based on publicly available information and user submissions. No endorsement, ranking, or recommendation is implied. This information does not constitute legal advice or solicitation. Users are advised to verify credentials independently through the respective State Bar Council.`

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function LawyersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [lawyers, setLawyers] = useState<LawyerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [manualLocation, setManualLocation] = useState(false)
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    practice_area: '',
    language: '',
    verified_only: false
  })
  const [sortOrder, setSortOrder] = useState<'name_asc' | 'name_desc'>('name_asc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    } else {
      setUser(getUser())
      setAuthChecked(true)
    }
  }, [router])

  // Detect user location on mount
  useEffect(() => {
    if (authChecked) {
      detectLocation()
    }
  }, [authChecked])

  // Fetch lawyers when filters change
  useEffect(() => {
    if (authChecked) {
      fetchLawyers()
    }
  }, [filters, sortOrder, page, location, authChecked])

  // Don't render until auth is checked
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

  const detectLocation = async () => {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        // Reverse geocode to get city/state
        const { latitude, longitude } = position.coords

        // Use a geocoding service (you'll need Google Maps API key)
        // For now, we'll use a simple IP-based location as fallback
        const response = await fetch(`https://ipapi.co/json/`)
        const data = await response.json()

        setLocation({
          city: data.city || '',
          state: data.region || '',
          detected: true
        })

        setFilters(prev => ({
          ...prev,
          city: data.city || '',
          state: data.region || ''
        }))
      } catch (error) {
        console.log('Location detection failed, user can select manually')
      }
    }
  }

  const fetchLawyers = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams({
        sort: sortOrder,
        page: page.toString(),
        limit: '20'
      })

      if (filters.city) params.append('city', filters.city)
      if (filters.state) params.append('state', filters.state)
      if (filters.practice_area) params.append('practice_area', filters.practice_area)
      if (filters.language) params.append('language', filters.language)
      if (filters.verified_only) params.append('verified_only', 'true')

      const response = await fetch(`${API_URL}/api/lawyers/directory?${params}`)

      if (response.ok) {
        const data = await response.json()
        setLawyers(data.lawyers || [])
        setTotal(data.total || 0)
        setTotalPages(data.pages || 1)
      } else {
        console.error('Failed to fetch lawyers')
        setLawyers([])
        setTotal(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error)
      setLawyers([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const calculateYearsOfPractice = (enrollmentDate: string): number => {
    const enrolled = new Date(enrollmentDate)
    const now = new Date()
    return now.getFullYear() - enrolled.getFullYear()
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
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-300 hover:text-amber-200 transition">Home</a>
              <a href="/lawyers" className="text-amber-200 font-semibold">Lawyer Directory</a>
              <a href="/cases" className="text-gray-300 hover:text-amber-200 transition">My Cases</a>
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

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Lawyer Directory
            </h2>
            <p className="text-xl text-gray-300 mb-4">
              Factual directory of advocates in India
            </p>
            <p className="text-sm text-gray-400 italic">
              Alphabetically sorted • No rankings or ratings
            </p>
          </div>

          {/* Compliance Disclaimer (Prominent) */}
          <div className="bg-amber-900/30 border-2 border-amber-500/50 rounded-xl p-4 mb-8 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-amber-200 font-bold mb-2">Important Disclaimer</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {MANDATORY_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>

          {/* Location Detection */}
          {location && location.detected && !manualLocation && (
            <div className="bg-blue-900/30 border-2 border-blue-500/50 rounded-xl p-4 mb-6 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="text-blue-200 font-bold">Location Detected</h3>
                    <p className="text-sm text-gray-300">
                      Showing advocates near <span className="font-semibold text-blue-200">{location.city}, {location.state}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setManualLocation(true)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-gray-300 hover:bg-white/20 transition"
                >
                  Change Location
                </button>
              </div>
            </div>
          )}

          {/* Manual Location Selection */}
          {(!location || manualLocation) && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
              <h3 className="text-lg font-semibold text-amber-200 mb-4 flex items-center">
                <span className="mr-2">📍</span>
                Select Your Location
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">City</label>
                  <input
                    type="text"
                    placeholder="e.g., Bangalore"
                    className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm"
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-200 mb-2">State</label>
                  <select
                    className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white backdrop-blur-sm"
                    value={filters.state}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  >
                    <option value="" className="bg-slate-800">All States</option>
                    <option value="Andhra Pradesh" className="bg-slate-800">Andhra Pradesh</option>
                    <option value="Karnataka" className="bg-slate-800">Karnataka</option>
                    <option value="Kerala" className="bg-slate-800">Kerala</option>
                    <option value="Tamil Nadu" className="bg-slate-800">Tamil Nadu</option>
                    <option value="Telangana" className="bg-slate-800">Telangana</option>
                    <option value="Delhi" className="bg-slate-800">Delhi</option>
                    <option value="Maharashtra" className="bg-slate-800">Maharashtra</option>
                    <option value="Gujarat" className="bg-slate-800">Gujarat</option>
                    <option value="Rajasthan" className="bg-slate-800">Rajasthan</option>
                    <option value="Uttar Pradesh" className="bg-slate-800">Uttar Pradesh</option>
                    <option value="West Bengal" className="bg-slate-800">West Bengal</option>
                  </select>
                </div>
              </div>
              {manualLocation && (
                <button
                  onClick={() => {
                    setManualLocation(false)
                    detectLocation()
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-sm text-blue-200 hover:bg-blue-500/30 transition"
                >
                  🔄 Use My Current Location
                </button>
              )}
            </div>
          )}

          {/* Filter Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
            <h3 className="text-lg font-semibold text-amber-200 mb-4">Filter Directory</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Practice Area</label>
                <select
                  className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white backdrop-blur-sm"
                  value={filters.practice_area}
                  onChange={(e) => setFilters({ ...filters, practice_area: e.target.value })}
                >
                  <option value="" className="bg-slate-800">All Practice Areas</option>
                  <option value="Criminal Law" className="bg-slate-800">Criminal Law</option>
                  <option value="Cyber Law" className="bg-slate-800">Cyber Law</option>
                  <option value="Civil Law" className="bg-slate-800">Civil Law</option>
                  <option value="Consumer Law" className="bg-slate-800">Consumer Law</option>
                  <option value="Family Law" className="bg-slate-800">Family Law</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">City</label>
                <input
                  type="text"
                  placeholder="e.g., Bangalore"
                  className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Language</label>
                <select
                  className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white backdrop-blur-sm"
                  value={filters.language}
                  onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                >
                  <option value="" className="bg-slate-800">All Languages</option>
                  <option value="English" className="bg-slate-800">English</option>
                  <option value="Hindi" className="bg-slate-800">Hindi</option>
                  <option value="Kannada" className="bg-slate-800">Kannada</option>
                  <option value="Tamil" className="bg-slate-800">Tamil</option>
                  <option value="Telugu" className="bg-slate-800">Telugu</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center space-x-2 text-gray-300">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20"
                  checked={filters.verified_only}
                  onChange={(e) => setFilters({ ...filters, verified_only: e.target.checked })}
                />
                <span className="text-sm">Show only verified profiles</span>
              </label>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Sort:</span>
                <select
                  className="p-2 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white text-sm backdrop-blur-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'name_asc' | 'name_desc')}
                >
                  <option value="name_asc" className="bg-slate-800">A → Z</option>
                  <option value="name_desc" className="bg-slate-800">Z → A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-center">
            <p className="text-gray-400">
              Showing {lawyers.length} advocate{lawyers.length !== 1 ? 's' : ''}
              {filters.city && ` in ${filters.city}`}
              {filters.practice_area && ` practicing ${filters.practice_area}`}
            </p>
          </div>

          {/* Lawyer Cards (BCI COMPLIANT) */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-400">Loading directory...</p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-bold text-amber-200 mb-3">No Lawyer Data Available</h3>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                The lawyer directory is empty. To populate it with real data:
              </p>
              <div className="bg-slate-800/50 rounded-lg p-6 max-w-2xl mx-auto text-left">
                <h4 className="text-amber-200 font-bold mb-3">📥 Import Lawyer Data:</h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>Download CSV from: <a href="https://data.gov.in/catalog/all-india-advocate-list" target="_blank" className="text-blue-300 underline">data.gov.in</a></li>
                  <li>Save as: <code className="bg-slate-900 px-2 py-1 rounded text-amber-200">backend/scripts/advocates_data.csv</code></li>
                  <li>Run: <code className="bg-slate-900 px-2 py-1 rounded text-amber-200">python3 backend/scripts/setup_lawyer_data.py</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {lawyers.map((lawyer) => (
                <div key={lawyer.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:bg-white/15 transition">
                  {/* Lawyer Name & Verification Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-200 mb-1">{lawyer.full_name}</h3>
                      <p className="text-sm text-gray-400">
                        {lawyer.city}, {lawyer.state}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Enrolled: {new Date(lawyer.enrollment_date).getFullYear()} • {calculateYearsOfPractice(lawyer.enrollment_date)} years of practice
                      </p>
                    </div>
                    {lawyer.profile_verified && (
                      <div className="flex items-center space-x-1 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30">
                        <span className="text-green-300">✓</span>
                        <span className="text-xs font-semibold text-green-200">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Enrollment Details */}
                  <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Enrollment Number</p>
                    <p className="text-sm font-mono text-amber-200">{lawyer.enrollment_number}</p>
                    <p className="text-xs text-gray-400 mt-2">Bar Council</p>
                    <p className="text-sm text-gray-300">{lawyer.bar_council_state}</p>
                  </div>

                  {/* Practice Areas */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Practice Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.practice_areas.map((area, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-200 text-sm rounded-full border border-blue-400/30">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Courts */}
                  {lawyer.courts_practicing_in && lawyer.courts_practicing_in.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">Courts</p>
                      <div className="text-sm text-gray-300">
                        {lawyer.courts_practicing_in.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.languages_known.map((lang, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded border border-purple-400/30">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Qualifications */}
                  {lawyer.law_degree && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-1">Qualifications</p>
                      <p className="text-sm text-gray-300">{lawyer.law_degree}</p>
                      {lawyer.law_school && (
                        <p className="text-xs text-gray-400 mt-1">{lawyer.law_school}</p>
                      )}
                    </div>
                  )}

                  {/* Contact Button */}
                  <button className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-amber-500/50 transition">
                    View Contact Information
                  </button>

                  {/* Individual Disclaimer */}
                  <p className="text-xs text-gray-500 mt-3 italic text-center">
                    Factual information only • Not a recommendation
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-4">
              <button
                className="px-4 py-2 border-2 border-amber-400 text-amber-200 font-semibold rounded-lg hover:bg-amber-400/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 border-2 border-amber-400 text-amber-200 font-semibold rounded-lg hover:bg-amber-400/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}

          {/* Bottom Disclaimer */}
          <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
            <h4 className="text-amber-200 font-bold mb-3 flex items-center">
              <span className="mr-2">ℹ️</span>
              How to Use This Directory
            </h4>
            <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
              <li>This directory contains factual information about advocates enrolled with State Bar Councils</li>
              <li>Listings are presented in alphabetical order only - no ranking or rating is implied</li>
              <li>Verify advocate credentials through the respective State Bar Council website</li>
              <li>Contact advocates directly to discuss your legal matter and their availability</li>
              <li>This platform does not endorse or recommend any specific advocate</li>
            </ul>
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
