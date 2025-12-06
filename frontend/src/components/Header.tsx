'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getUser, isAuthenticated, logout } from '@/utils/auth'
import Link from 'next/link'
import { User, LogOut, Calendar, Menu, ChevronDown } from 'lucide-react'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [appointments, setAppointments] = useState<any[]>([])

  // Function to check and update auth status
  const checkAuthStatus = () => {
    if (isAuthenticated()) {
      const u = getUser()
      setUser(u)
      
      // Fetch appointments for badge and quick view
      if (u) {
          const userId = u.id || u.email
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/lawyers/appointments?user_id=${userId}`)
            .then(res => res.json())
            .then(data => {
                // Filter for future/active appointments (logic can be refined)
                const active = data.slice(0, 3) // Show detailed top 3
                setAppointments(active)
                setUpcomingCount(data.length)
            })
            .catch(err => console.error("Failed to fetch header appointments", err))
      }
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    // Check auth status on mount
    checkAuthStatus()

    // Re-check auth status when window regains focus (e.g., after login redirect)
    const handleFocus = () => {
      checkAuthStatus()
    }

    // Re-check auth status on storage changes (e.g., login in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthStatus()
      }
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [pathname]) // Re-check when route changes
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleLogout = () => {
    logout()
    setUser(null)
    setIsMenuOpen(false)
    router.push('/login')
  }

  return (
    <header className="bg-white backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">⚖️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                JustiFly
              </h1>
              <p className="text-xs text-gray-600">Justice Takes Flight</p>
            </div>
          </Link>

            {/* Nav */}
            {/* Nav */}
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex space-x-6 items-center">
                <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition">Home</Link>
                <Link href="/lawyers" className="text-gray-700 hover:text-blue-600 font-medium transition">Lawyer Directory</Link>
                <Link href="/cases" className="text-gray-700 hover:text-blue-600 font-medium transition">My Cases</Link>
                {user && (
                    <Link href="/appointments" className="text-gray-700 hover:text-blue-600 font-medium transition">Appointments</Link>
                )}
              </nav>

            {/* Auth / User Menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu size={24} />
                {user && upcomingCount > 0 && (
                   <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {user ? (
                <div className="relative" ref={menuRef}>
                  {/* Desktop Profile Button */}
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg hover:shadow-blue-500/30 transition transform hover:scale-105 border-2 border-white cursor-pointer hidden md:flex"
                    title="Profile & Appointments"
                  >
                     <User size={20} />
                     {upcomingCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-fade-in">
                          {upcomingCount}
                        </span>
                     )}
                  </button>

                  {/* Unified Dropdown Menu */}
                  {isMenuOpen && (
                     <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform origin-top-right transition-all z-50 animate-fade-in">
                        {/* User Info Header */}
                        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                          <div>
                              <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{user.name || 'User'}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                          </div>
                          {upcomingCount > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                  {upcomingCount} Active
                              </span>
                          )}
                        </div>
                        
                        {/* Mobile & Desktop Navigation Mixed */}
                        <div className="md:hidden border-b border-gray-100 p-2">
                           <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
                           <Link href="/lawyers" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Lawyer Directory</Link>
                           <Link href="/cases" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>My Cases</Link>
                           <Link href="/appointments" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setIsMenuOpen(false)}>Appointments</Link>
                        </div>
                        
                        {/* Quick Appointments List (Desktop & Mobile) */}
                        <div className="p-2">
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center">
                              <Calendar size={12} className="mr-1.5" />
                              Your Bookings
                          </div>
                          
                          {appointments.length > 0 ? (
                              <div className="space-y-1 mb-2">
                                  {appointments.map((apt: any) => (
                                      <div key={apt.id} className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100/50 hover:bg-blue-50 transition border-l-4 border-l-blue-500">
                                          <div className="flex justify-between items-start">
                                              <div>
                                                  <p className="font-bold text-sm text-gray-800">{apt.lawyer_name}</p>
                                                  <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                                      <span className="font-medium text-blue-600 mr-2">{apt.appointment_date}</span>
                                                      <span>{apt.slot_time}</span>
                                                  </p>
                                              </div>
                                              <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">
                                                  {apt.mode === 'Video Call' ? '📹' : '📍'}
                                              </span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="text-center py-4 mb-2 bg-gray-50 rounded-lg mx-2 border border-dashed border-gray-200">
                                  <p className="text-xs text-gray-500">No upcoming appointments</p>
                              </div>
                          )}

                          <button 
                            onClick={() => {
                              router.push('/appointments')
                              setIsMenuOpen(false)
                            }}
                            className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 py-1.5 hover:bg-blue-50 rounded-lg transition mb-2"
                          >
                             View All Appointments →
                          </button>
                          
                          <div className="h-px bg-gray-100 my-1 mx-2"></div>
                          
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                          >
                             <LogOut size={16} />
                             <span className="font-medium text-sm">Sign Out</span>
                          </button>
                        </div>
                     </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                   {/* Mobile Dropdown for Guests */}
                   {isMenuOpen && (
                      <div className="absolute right-4 top-20 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 md:hidden animate-fade-in">
                          <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Home</Link>
                          <Link href="/lawyers" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Lawyer Directory</Link>
                          <Link href="/cases" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>My Cases</Link>
                          <div className="h-px bg-gray-100 my-1"></div>
                          <Link href="/login" className="block px-3 py-2 text-blue-600 font-bold hover:bg-blue-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>Login</Link>
                      </div>
                   )}

                   <button
                      onClick={() => router.push('/login')}
                      className="hidden md:flex px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:shadow-lg transition items-center space-x-2"
                   >
                      <span>Login</span>
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
