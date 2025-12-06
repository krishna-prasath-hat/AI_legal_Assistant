'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { isAuthenticated, getUser, logout } from '@/utils/auth'
import LawyerChatModal from './LawyerChatModal'
import Header from '@/components/Header'

const LawyerMap = dynamic(() => import('@/components/LawyerMap'), { 
  ssr: false,
  loading: () => <div className="h-[450px] w-full rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
})

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
  id: number
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
  latitude?: number
  longitude?: number
}

interface LocationData {
  city: string
  state: string
  lat?: number
  lng?: number
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
    practice_area: '',
    verified_only: false
  })
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [sortOrder, setSortOrder] = useState<'name_asc' | 'name_desc' | 'distance'>('name_asc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // New State for Dynamic Location
  const [manualCityEntry, setManualCityEntry] = useState(false)
  const lastGeocodedCoords = useRef<{lat: number, lng: number} | null>(null)
  
  // Chat Modal State
  const [selectedLawyer, setSelectedLawyer] = useState<any>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  // Helper to calculate distance
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    const d = R * c; // Distance in km
    return d;
  }

  const detectLocation = async (onlyDetectLatLng = false) => {
    setDetectingLocation(true)
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })

        // Reverse geocode to get city/state using OpenStreetMap (Free, No Key)
        const { latitude, longitude } = position.coords
        
        let detectedCity = ''
        let detectedState = ''

        try {
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          if (geoResponse.ok) {
             const geoData = await geoResponse.json()
             // Nominatim can return city/town/village/county
             detectedCity = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county || ''
             detectedState = geoData.address.state || ''
             
             // Clean up city name (remove " District", etc if needed)
             detectedCity = detectedCity.replace(' District', '').replace(' City', '')
          }
        } catch (e) {
          console.error("Nominatim geocoding failed, falling back to IP")
        }

        // Fallback to IP-based if Reverse Geocoding failed
        if (!detectedCity) {
           try {
             const response = await fetch(`https://ipapi.co/json/`)
             const data = await response.json()
             detectedCity = data.city || ''
             detectedState = data.region || ''
           } catch (e) {
             console.error("IP Geolocation failed")
           }
        }

        setLocation({
          city: detectedCity,
          state: detectedState,
          lat: latitude,
          lng: longitude,
          detected: true
        })

        if (!onlyDetectLatLng && detectedCity) {
          setFilters(prev => ({
            ...prev,
            city: detectedCity
          }))
        }
      } catch (error) {
        console.log('Location detection failed, user can select manually')
      }
    }
    setDetectingLocation(false)
  }



  // Check authentication on mount
  // Check authentication on mount and set initial filters from URL
  const searchParams = useSearchParams()
  useEffect(() => {
      // Just set user if logged in, don't redirect guests (Public Directory)
      if (!isAuthenticated()) {
         router.push('/login')
      } else {
         setUser(getUser())
         setAuthChecked(true)
      }
      
      // Auto pre-fill from URL params (e.g., from home page incident analysis)
      const practice = searchParams?.get('practice_area')
      const city = searchParams?.get('city')
      
      if (practice || city) {
        setFilters(prev => ({
          ...prev,
          practice_area: practice || prev.practice_area,
          city: city || prev.city
        }))
        // If city provided, we might still want to detect location for lat/lng (for map centering)
        // But we shouldn't overwrite the city filter.
        setManualCityEntry(true) // Treat URL param as manual entry
        detectLocation(true) // Pass flag to 'onlyDetectLatLng'
      } else {
        // No city provided, let the dynamic watcher handle it or trigger an initial detection
        // checking initially is good for immediate feedback
        detectLocation()
      }
  }, [router, searchParams]) // Removed authChecked from deps to prevent loop

  // Dynamic Location Watcher
  useEffect(() => {
    let watchId: number | null = null;

    if (authChecked && !manualCityEntry && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(async (position) => {
        const { latitude, longitude } = position.coords
        
        // Calculate distance from last geocoded point to avoid spamming API
        if (lastGeocodedCoords.current) {
          const dist = getDistanceFromLatLonInKm(
            lastGeocodedCoords.current.lat, 
            lastGeocodedCoords.current.lng, 
            latitude, 
            longitude
          )
          // Only re-geocode if moved > 2km
          if (dist < 2) return; 
        }

        // Reverse Geocode
        try {
          // Update ref immediately to prevent race conditions
          lastGeocodedCoords.current = { lat: latitude, lng: longitude }
          
          const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          if (geoResponse.ok) {
             const geoData = await geoResponse.json()
             let detectedCity = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.county || ''
             const detectedState = geoData.address.state || ''
             detectedCity = detectedCity.replace(' District', '').replace(' City', '')

             if (detectedCity) {
               setLocation(prev => ({
                 ...prev,
                 city: detectedCity,
                 state: detectedState,
                 lat: latitude,
                 lng: longitude,
                 detected: true
               }))
               
               // Auto-update filter if user hasn't typed manually
               setFilters(prev => ({ ...prev, city: detectedCity }))
             }
          }
        } catch (e) {
          console.error("Dynamic location update failed", e)
        }
      }, (error) => {
        console.error("Location watch error", error)
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
    }
  }, [authChecked, manualCityEntry])

  // Don't auto-fetch - only fetch when user clicks Search button
  // Removed auto-fetch on filter change

  // Don't render until auth is checked
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚖️</div>
          <p className="text-gray-700">Checking authentication...</p>
        </div>
      </div>
    )
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
      if (filters.practice_area) params.append('practice_area', filters.practice_area)
      if (filters.verified_only) params.append('verified_only', 'true')
      
      // Pass location for map features
      if (location?.lat && location?.lng) {
        params.append('user_lat', location.lat.toString())
        params.append('user_lng', location.lng.toString())
      }

      const response = await fetch(`${API_URL}/api/v1/lawyers/directory?${params}`)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Justice Scales Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-20 left-10 text-9xl animate-pulse">⚖️</div>
        <div className="absolute top-40 right-20 text-7xl animate-pulse delay-1000">⚖️</div>
        <div className="absolute bottom-20 left-1/4 text-8xl animate-pulse delay-2000">⚖️</div>
        <div className="absolute bottom-40 right-1/3 text-6xl animate-pulse delay-3000">⚖️</div>
      </div>

      <Header />

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Lawyer Directory
            </h2>
            <p className="text-xl text-gray-700 mb-4">
              Factual directory of advocates in India
            </p>
            <p className="text-sm text-gray-600 italic">
              Alphabetically sorted • No rankings or ratings
            </p>
          </div>

          {/* Compliance Disclaimer (Prominent) */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8 bg-white">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-blue-600 font-bold mb-2">Important Disclaimer</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {MANDATORY_DISCLAIMER}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Map Section */}
          <div className="mb-8">
            {location && location.lat && location.lng && (
               <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="p-4 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
                    <h3 className="font-bold text-blue-900 flex items-center">
                       <span className="mr-2">🗺️</span> Lawyers Near You
                    </h3>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                       {location.city} area
                    </span>
                  </div>
                  <div className="p-4">
                     <LawyerMap 
                        lawyers={lawyers} 
                        center={[location.lat, location.lng]} 
                     />
                  </div>
               </div>
            )}
            
            {/* Fallback if no location but user is browsing manually */}
            {(!location || !location.lat) && (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center">
                   <p className="text-orange-800">
                     📍 Enable Location services or Select "Use Current Location" to see lawyers on the map.
                   </p>
                   <button 
                     onClick={() => detectLocation()}
                     className="mt-2 text-sm bg-white border border-orange-300 px-3 py-1 rounded hover:bg-orange-100 transition text-orange-700 font-semibold"
                   >
                     Enable Location Search
                   </button>
                </div>
            )}
          </div>

          {/* Location Detection Badge */}
          {location && location.detected && !manualLocation && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 bg-white hidden"> 
               {/* Hidden this old card since map shows location */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📍</div>
                  <div>
                    <h3 className="text-blue-600 font-bold">Location Detected</h3>
                    <p className="text-sm text-gray-700">
                      Showing advocates in <span className="font-semibold text-blue-600">{location.city}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setManualLocation(true)}
                  className="px-4 py-2 bg-white border border-gray-200 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-white/20 transition"
                >
                  Change Location
                </button>
              </div>
            </div>
          )}



          {/* Filter Section */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Directory</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Practice Area</label>
                <select
                  className="w-full p-3 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  value={filters.practice_area}
                  onChange={(e) => setFilters({ ...filters, practice_area: e.target.value })}
                >
                  <option value="">All Practice Areas</option>
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Cyber Law">Cyber Law</option>
                  <option value="Civil Law">Civil Law</option>
                  <option value="Consumer Law">Consumer Law</option>
                  <option value="Family Law">Family Law</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g., Bangalore, Mumbai, Delhi"
                    className="w-full p-3 pr-12 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 placeholder-gray-400"
                    value={filters.city}
                    onChange={(e) => {
                       setFilters({ ...filters, city: e.target.value })
                       setManualCityEntry(true)
                    }}
                  />
                  <button
                    onClick={() => {
                       setManualCityEntry(false) // Reset manual flag to allow auto-update
                       detectLocation() 
                    }}
                    disabled={detectingLocation}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition p-1 disabled:opacity-50"
                    title="Use my current location"
                  >
                    {detectingLocation ? <span className="animate-spin inline-block">↻</span> : '📍'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center space-x-2 text-gray-700">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300"
                  checked={filters.verified_only}
                  onChange={(e) => setFilters({ ...filters, verified_only: e.target.checked })}
                />
                <span className="text-sm">Show only verified profiles</span>
              </label>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sort:</span>
                  <select
                    className="p-2 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 text-sm"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                  >
                    <option value="name_asc">A → Z</option>
                    <option value="name_desc">Z → A</option>
                    <option value="distance">📍 Nearest First</option>
                  </select>
                </div>
                
                {/* Search Button */}
                <button
                  onClick={() => fetchLawyers()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg transition"
                >
                  🔍 Search
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-center">
            <p className="text-gray-600">
              Showing {lawyers.length} advocate{lawyers.length !== 1 ? 's' : ''}
              {filters.city && ` in ${filters.city}`}
              {filters.practice_area && ` practicing ${filters.practice_area}`}
            </p>
          </div>

          {/* Lawyer Cards (BCI COMPLIANT) */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading directory...</p>
            </div>
          ) : lawyers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-bold text-blue-600 mb-3">No Lawyer Data Available</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                The lawyer directory is empty. To populate it with real data:
              </p>
              <div className="bg-slate-800/50 rounded-lg p-6 max-w-2xl mx-auto text-left">
                <h4 className="text-blue-600 font-bold mb-3">📥 Import Lawyer Data:</h4>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Download CSV from: <a href="https://data.gov.in/catalog/all-india-advocate-list" target="_blank" className="text-blue-300 underline">data.gov.in</a></li>
                  <li>Save as: <code className="bg-slate-900 px-2 py-1 rounded text-blue-600">backend/scripts/advocates_data.csv</code></li>
                  <li>Run: <code className="bg-slate-900 px-2 py-1 rounded text-blue-600">python3 backend/scripts/setup_lawyer_data.py</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {lawyers.map((lawyer) => (
                <div key={lawyer.id} className="bg-white border border-gray-200 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-300 hover:bg-gray-50 transition">
                  {/* Lawyer Name & Verification Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-600 mb-1">{lawyer.full_name}</h3>
                      <p className="text-sm text-gray-600">
                        {lawyer.city}, {lawyer.state}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Enrolled: {new Date(lawyer.enrollment_date).getFullYear()} • {calculateYearsOfPractice(lawyer.enrollment_date)} years of practice
                      </p>
                    </div>
                    {lawyer.profile_verified && (
                      <div className="flex items-center space-x-1 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                        <span className="text-cyan-600 font-bold">✓</span>
                        <span className="text-xs font-semibold text-cyan-700">Verified</span>
                      </div>
                    )}
                  </div>

                  {/* Enrollment Details */}
                  <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Enrollment Number</p>
                    <p className="text-sm font-mono text-blue-600">{lawyer.enrollment_number}</p>
                    <p className="text-xs text-gray-600 mt-2">Bar Council</p>
                    <p className="text-sm text-gray-700">{lawyer.bar_council_state}</p>
                  </div>

                  {/* Practice Areas */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Practice Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.practice_areas.map((area, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full border border-blue-300">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Courts */}
                  {lawyer.courts_practicing_in && lawyer.courts_practicing_in.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-2">Courts</p>
                      <div className="text-sm text-gray-700">
                        {lawyer.courts_practicing_in.join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {lawyer.languages_known.map((lang, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded border border-gray-200 font-medium">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Qualifications */}
                  {lawyer.law_degree && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-1">Qualifications</p>
                      <p className="text-sm text-gray-700">{lawyer.law_degree}</p>
                      {lawyer.law_school && (
                        <p className="text-xs text-gray-600 mt-1">{lawyer.law_school}</p>
                      )}
                    </div>
                  )}

                  {/* Contact Button */}
                  <button 
                    onClick={() => {
                        setSelectedLawyer(lawyer)
                        setIsChatOpen(true)
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition flex items-center justify-center space-x-2"
                  >
                    <span>💬</span>
                    <span>Check Availability</span>
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
                className="px-4 py-2 border-2 border-blue-400 text-blue-600 font-semibold rounded-lg hover:bg-blue-400/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 border-2 border-blue-400 text-blue-600 font-semibold rounded-lg hover:bg-blue-400/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}

          {/* Bottom Disclaimer */}
          <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
            <h4 className="text-blue-600 font-bold mb-3 flex items-center">
              <span className="mr-2">ℹ️</span>
              How to Use This Directory
            </h4>
            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
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

      {/* Chat Modal */}
      {selectedLawyer && (
        <LawyerChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          lawyer={selectedLawyer}
        />
      )}
    </div>
  )
}
