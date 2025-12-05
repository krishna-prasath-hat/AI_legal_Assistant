'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getUser, logout } from '@/utils/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Case {
  id: number
  case_number: string
  title: string
  description: string
  case_type: string
  status: string
  incident_date: string | null
  location: string | null
  police_station: string | null
  fir_number: string | null
  lawyer_name: string | null
  court_name: string | null
  next_hearing_date: string | null
  created_at: string
  updated_at: string
}

interface CaseUpdate {
  id: number
  title: string
  description: string
  update_type: string
  created_by_name: string
  created_by_role: string
  created_at: string
}

export default function CasesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [caseUpdates, setCaseUpdates] = useState<CaseUpdate[]>([])
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  // Form states
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    case_type: 'criminal',
    incident_date: '',
    location: '',
    police_station: '',
    fir_number: ''
  })

  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    update_type: 'general'
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    } else {
      setUser(getUser())
      setAuthChecked(true)
    }
  }, [router])

  useEffect(() => {
    if (authChecked) {
      fetchCases()
    }
  }, [authChecked])

  const fetchCases = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/v1/cases/`)
      if (response.ok) {
        const data = await response.json()
        setCases(data.cases || [])
      }
    } catch (error) {
      console.error('Error fetching cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCase = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/v1/cases/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase)
      })

      if (response.ok) {
        setShowCreateModal(false)
        setNewCase({
          title: '',
          description: '',
          case_type: 'criminal',
          incident_date: '',
          location: '',
          police_station: '',
          fir_number: ''
        })
        fetchCases()
      }
    } catch (error) {
      console.error('Error creating case:', error)
    }
  }

  const fetchCaseUpdates = async (caseId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cases/${caseId}/updates`)
      if (response.ok) {
        const data = await response.json()
        setCaseUpdates(data)
      }
    } catch (error) {
      console.error('Error fetching updates:', error)
    }
  }

  const addCaseUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCase) return

    try {
      const response = await fetch(`${API_URL}/api/v1/cases/${selectedCase.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUpdate)
      })

      if (response.ok) {
        setNewUpdate({ title: '', description: '', update_type: 'general' })
        fetchCaseUpdates(selectedCase.id)
      }
    } catch (error) {
      console.error('Error adding update:', error)
    }
  }

  const updateCaseStatus = async (caseId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cases/${caseId}/status?new_status=${newStatus}`, {
        method: 'PUT'
      })

      if (response.ok) {
        fetchCases()
        if (selectedCase?.id === caseId) {
          const updatedCase = await response.json()
          setSelectedCase(updatedCase)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const deleteCase = async (caseId: number) => {
    if (!confirm('Are you sure you want to delete this case?')) return

    try {
      const response = await fetch(`${API_URL}/api/v1/cases/${caseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCases()
        setSelectedCase(null)
      }
    } catch (error) {
      console.error('Error deleting case:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-cyan-100 text-cyan-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-200 text-gray-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getCaseTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      criminal: '⚖️',
      civil: '📋',
      family: '👨‍👩‍👧',
      consumer: '🛒',
      cyber: '💻',
      property: '🏠',
      other: '📄'
    }
    return icons[type] || '📄'
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">⚖️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                JustiFly
              </h1>
              <p className="text-xs text-gray-600">Justice Takes Flight</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition">Home</a>
              <a href="/lawyers" className="text-gray-700 hover:text-blue-600 transition">Lawyer Directory</a>
              <a href="/cases" className="text-blue-600 font-semibold">My Cases</a>
            </nav>
            {user && (
              <div className="flex items-center space-x-3 border-l border-gray-300 pl-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">{user.name || user.email}</p>
                  <p className="text-xs text-gray-600">Logged in</p>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-red-100 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-200 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-6xl mb-4">📁</div>
              <h2 className="text-4xl font-bold mb-2 text-gray-900">
                My Cases
              </h2>
              <p className="text-xl text-gray-700">
                Manage and track your legal cases
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition"
            >
              + Create New Case
            </button>
          </div>

          {/* Cases List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading cases...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-gray-200">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Cases Yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first case to start tracking your legal matters
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition"
              >
                Create Your First Case
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((caseItem) => (
                <div
                  key={caseItem.id}
                  onClick={() => {
                    setSelectedCase(caseItem)
                    fetchCaseUpdates(caseItem.id)
                  }}
                  className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-blue-500 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getCaseTypeIcon(caseItem.case_type)}</span>
                      <div>
                        <p className="text-xs text-gray-600">Case #{caseItem.case_number}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {caseItem.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {caseItem.description}
                  </p>

                  <div className="space-y-2 text-xs text-gray-600">
                    {caseItem.location && (
                      <div className="flex items-center">
                        <span className="mr-2">📍</span>
                        {caseItem.location}
                      </div>
                    )}
                    {caseItem.lawyer_name && (
                      <div className="flex items-center">
                        <span className="mr-2">👨‍⚖️</span>
                        {caseItem.lawyer_name}
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      {new Date(caseItem.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Create New Case</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={createCase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Case Title *</label>
                <input
                  type="text"
                  required
                  minLength={10}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  placeholder="Brief title for your case"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
                <textarea
                  required
                  minLength={50}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  placeholder="Detailed description of your case..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Case Type *</label>
                  <select
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    value={newCase.case_type}
                    onChange={(e) => setNewCase({ ...newCase, case_type: e.target.value })}
                  >
                    <option value="criminal">Criminal</option>
                    <option value="civil">Civil</option>
                    <option value="family">Family</option>
                    <option value="consumer">Consumer</option>
                    <option value="cyber">Cyber</option>
                    <option value="property">Property</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Incident Date</label>
                  <input
                    type="date"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    value={newCase.incident_date}
                    onChange={(e) => setNewCase({ ...newCase, incident_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                  value={newCase.location}
                  onChange={(e) => setNewCase({ ...newCase, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Police Station</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    value={newCase.police_station}
                    onChange={(e) => setNewCase({ ...newCase, police_station: e.target.value })}
                    placeholder="Police station name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">FIR Number</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
                    value={newCase.fir_number}
                    onChange={(e) => setNewCase({ ...newCase, fir_number: e.target.value })}
                    placeholder="FIR number if filed"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                >
                  Create Case
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedCase.title}</h2>
                  <p className="text-blue-100">Case #{selectedCase.case_number}</p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Case Info */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <h3 className="font-bold text-blue-900 text-lg mb-3">Case Information</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedCase.status)}`}>
                      {selectedCase.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-bold text-gray-900 capitalize">{selectedCase.case_type}</p>
                  </div>
                  {selectedCase.location && (
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-bold text-gray-900">{selectedCase.location}</p>
                    </div>
                  )}
                  {selectedCase.fir_number && (
                    <div>
                      <p className="text-gray-600">FIR Number</p>
                      <p className="font-bold text-gray-900">{selectedCase.fir_number}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedCase.description}</p>
              </div>

              {/* Status Update */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                <h3 className="font-bold text-yellow-900 text-lg mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['draft', 'active', 'pending', 'in_progress', 'resolved', 'closed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateCaseStatus(selectedCase.id, status)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        selectedCase.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-500'
                      }`}
                    >
                      {status.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Case Updates */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-green-900 text-lg">Case Updates</h3>
                  <button
                    onClick={() => setShowUpdateModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                  >
                    + Add Update
                  </button>
                </div>

                {caseUpdates.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No updates yet</p>
                ) : (
                  <div className="space-y-3">
                    {caseUpdates.map((update) => (
                      <div key={update.id} className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-green-900">{update.title}</h4>
                          <span className="text-xs text-gray-600">
                            {new Date(update.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{update.description}</p>
                        <p className="text-xs text-gray-600">
                          By {update.created_by_name} ({update.created_by_role})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => deleteCase(selectedCase.id)}
                  className="px-6 py-3 bg-red-100 border-2 border-red-300 text-red-600 font-bold rounded-xl hover:bg-red-200 transition"
                >
                  Delete Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Update Modal */}
      {showUpdateModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add Case Update</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={addCaseUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Update Title *</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  placeholder="Brief title for this update"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  value={newUpdate.description}
                  onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                  placeholder="Describe the update..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Update Type</label>
                <select
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-gray-900"
                  value={newUpdate.update_type}
                  onChange={(e) => setNewUpdate({ ...newUpdate, update_type: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="hearing">Hearing</option>
                  <option value="document">Document</option>
                  <option value="status_change">Status Change</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                >
                  Add Update
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
