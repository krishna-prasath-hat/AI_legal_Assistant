'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getUser, logout } from '@/utils/auth'
import Header from '@/components/Header'

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

interface CaseFollowUp {
  id: number
  case_id: number
  title: string
  description: string | null
  followup_type: string
  status: string
  scheduled_date: string
  completed_date: string | null
  court_name: string | null
  judge_name: string | null
  hearing_type: string | null
  case_number: string | null
  location: string | null
  room_number: string | null
  outcome: string | null
  next_steps: string | null
  created_by_name: string
  created_by_role: string
  created_at: string
  updated_at: string
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
  const [caseFollowUps, setCaseFollowUps] = useState<CaseFollowUp[]>([])
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState<CaseFollowUp | null>(null)

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

  const [newFollowUp, setNewFollowUp] = useState({
    title: '',
    description: '',
    followup_type: 'hearing',
    scheduled_date: '',
    court_name: '',
    judge_name: '',
    hearing_type: '',
    case_number: '',
    location: '',
    room_number: '',
    outcome: '',
    next_steps: ''
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

  const fetchCaseFollowUps = async (caseId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/cases/${caseId}/followups`)
      if (response.ok) {
        const data = await response.json()
        setCaseFollowUps(data)
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error)
    }
  }

  const addOrUpdateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCase) return

    try {
      const url = editingFollowUp
        ? `${API_URL}/api/v1/cases/${selectedCase.id}/followups/${editingFollowUp.id}`
        : `${API_URL}/api/v1/cases/${selectedCase.id}/followups`
      
      const method = editingFollowUp ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFollowUp)
      })

      if (response.ok) {
        setShowFollowUpModal(false)
        setEditingFollowUp(null)
        setNewFollowUp({
          title: '',
          description: '',
          followup_type: 'hearing',
          scheduled_date: '',
          court_name: '',
          judge_name: '',
          hearing_type: '',
          case_number: '',
          location: '',
          room_number: '',
          outcome: '',
          next_steps: ''
        })
        fetchCaseFollowUps(selectedCase.id)
        fetchCases() // Refresh to update next_hearing_date
      }
    } catch (error) {
      console.error('Error saving follow-up:', error)
    }
  }

  const deleteFollowUp = async (followupId: number) => {
    if (!selectedCase || !confirm('Are you sure you want to delete this follow-up?')) return

    try {
      const response = await fetch(`${API_URL}/api/v1/cases/${selectedCase.id}/followups/${followupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCaseFollowUps(selectedCase.id)
        fetchCases()
      }
    } catch (error) {
      console.error('Error deleting follow-up:', error)
    }
  }

  const openFollowUpModal = (followup?: CaseFollowUp) => {
    if (followup) {
      setEditingFollowUp(followup)
      setNewFollowUp({
        title: followup.title,
        description: followup.description || '',
        followup_type: followup.followup_type,
        scheduled_date: followup.scheduled_date.split('T')[0],
        court_name: followup.court_name || '',
        judge_name: followup.judge_name || '',
        hearing_type: followup.hearing_type || '',
        case_number: followup.case_number || '',
        location: followup.location || '',
        room_number: followup.room_number || '',
        outcome: followup.outcome || '',
        next_steps: followup.next_steps || ''
      })
    } else {
      setEditingFollowUp(null)
      setNewFollowUp({
        title: '',
        description: '',
        followup_type: 'hearing',
        scheduled_date: '',
        court_name: '',
        judge_name: '',
        hearing_type: '',
        case_number: '',
        location: '',
        room_number: '',
        outcome: '',
        next_steps: ''
      })
    }
    setShowFollowUpModal(true)
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
      <Header />

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
                    fetchCaseFollowUps(caseItem.id)
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

              {/* Follow-ups & Hearings */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-purple-900 text-lg">📅 Follow-ups & Hearings</h3>
                  <button
                    onClick={() => openFollowUpModal()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold"
                  >
                    + Add Follow-up
                  </button>
                </div>

                {caseFollowUps.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No follow-ups scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {caseFollowUps.map((followup) => {
                      const scheduledDate = new Date(followup.scheduled_date)
                      const isUpcoming = scheduledDate >= new Date()
                      const isPast = scheduledDate < new Date()
                      const isCompleted = followup.status === 'completed'
                      
                      return (
                        <div 
                          key={followup.id} 
                          className={`bg-white rounded-lg p-4 border-2 ${
                            isCompleted ? 'border-gray-300' : 
                            isUpcoming ? 'border-purple-400' : 'border-orange-400'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">
                                  {followup.followup_type === 'hearing' ? '⚖️' :
                                   followup.followup_type === 'court_date' ? '🏛️' :
                                   followup.followup_type === 'lawyer_meeting' ? '👨‍⚖️' :
                                   followup.followup_type === 'document_submission' ? '📄' :
                                   followup.followup_type === 'evidence_collection' ? '🔍' :
                                   followup.followup_type === 'witness_interview' ? '👤' : '📋'}
                                </span>
                                <div>
                                  <h4 className="font-bold text-purple-900">{followup.title}</h4>
                                  <p className="text-xs text-gray-600 capitalize">
                                    {followup.followup_type.replace('_', ' ')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-2 text-sm mb-2">
                                <div className="flex items-center gap-1">
                                  <span>📅</span>
                                  <span className={`font-semibold ${isUpcoming && !isCompleted ? 'text-purple-700' : 'text-gray-700'}`}>
                                    {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                                <div>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                    followup.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    followup.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                    followup.status === 'postponed' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {followup.status.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              {followup.description && (
                                <p className="text-sm text-gray-700 mb-2">{followup.description}</p>
                              )}

                              <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                                {followup.court_name && (
                                  <div className="flex items-start gap-1">
                                    <span>🏛️</span>
                                    <span><strong>Court:</strong> {followup.court_name}</span>
                                  </div>
                                )}
                                {followup.judge_name && (
                                  <div className="flex items-start gap-1">
                                    <span>👨‍⚖️</span>
                                    <span><strong>Judge:</strong> {followup.judge_name}</span>
                                  </div>
                                )}
                                {followup.hearing_type && (
                                  <div className="flex items-start gap-1">
                                    <span>📋</span>
                                    <span><strong>Type:</strong> {followup.hearing_type}</span>
                                  </div>
                                )}
                                {followup.location && (
                                  <div className="flex items-start gap-1">
                                    <span>📍</span>
                                    <span><strong>Location:</strong> {followup.location}</span>
                                  </div>
                                )}
                                {followup.room_number && (
                                  <div className="flex items-start gap-1">
                                    <span>🚪</span>
                                    <span><strong>Room:</strong> {followup.room_number}</span>
                                  </div>
                                )}
                                {followup.case_number && (
                                  <div className="flex items-start gap-1">
                                    <span>📑</span>
                                    <span><strong>Case #:</strong> {followup.case_number}</span>
                                  </div>
                                )}
                              </div>

                              {followup.outcome && (
                                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                  <p className="text-xs font-semibold text-green-900">Outcome:</p>
                                  <p className="text-sm text-gray-700">{followup.outcome}</p>
                                </div>
                              )}

                              {followup.next_steps && (
                                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-xs font-semibold text-blue-900">Next Steps:</p>
                                  <p className="text-sm text-gray-700">{followup.next_steps}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openFollowUpModal(followup)
                                }}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition text-xs font-semibold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteFollowUp(followup.id)
                                }}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-xs font-semibold"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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

      {/* Add/Edit Follow-up Modal */}
      {showFollowUpModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingFollowUp ? 'Edit Follow-up' : 'Add Follow-up / Hearing'}
                </h2>
                <button
                  onClick={() => {
                    setShowFollowUpModal(false)
                    setEditingFollowUp(null)
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={addOrUpdateFollowUp} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Follow-up Type *</label>
                  <select
                    required
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    value={newFollowUp.followup_type}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, followup_type: e.target.value })}
                  >
                    <option value="hearing">Court Hearing</option>
                    <option value="court_date">Court Date</option>
                    <option value="lawyer_meeting">Lawyer Meeting</option>
                    <option value="document_submission">Document Submission</option>
                    <option value="evidence_collection">Evidence Collection</option>
                    <option value="witness_interview">Witness Interview</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    value={newFollowUp.scheduled_date}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, scheduled_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  minLength={5}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                  value={newFollowUp.title}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, title: e.target.value })}
                  placeholder="e.g., Preliminary Hearing, Evidence Submission"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                  value={newFollowUp.description}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, description: e.target.value })}
                  placeholder="Additional details about this follow-up..."
                />
              </div>

              {/* Conditional fields for hearings/court dates */}
              {(newFollowUp.followup_type === 'hearing' || newFollowUp.followup_type === 'court_date') && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Court Name</label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                        value={newFollowUp.court_name}
                        onChange={(e) => setNewFollowUp({ ...newFollowUp, court_name: e.target.value })}
                        placeholder="e.g., District Court, Chennai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Judge Name</label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                        value={newFollowUp.judge_name}
                        onChange={(e) => setNewFollowUp({ ...newFollowUp, judge_name: e.target.value })}
                        placeholder="e.g., Hon. Justice Smith"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Hearing Type</label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                        value={newFollowUp.hearing_type}
                        onChange={(e) => setNewFollowUp({ ...newFollowUp, hearing_type: e.target.value })}
                        placeholder="e.g., Preliminary, Final, Evidence"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Court Case Number</label>
                      <input
                        type="text"
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                        value={newFollowUp.case_number}
                        onChange={(e) => setNewFollowUp({ ...newFollowUp, case_number: e.target.value })}
                        placeholder="Court assigned case number"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    value={newFollowUp.location}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, location: e.target.value })}
                    placeholder="Full address or location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Room Number</label>
                  <input
                    type="text"
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                    value={newFollowUp.room_number}
                    onChange={(e) => setNewFollowUp({ ...newFollowUp, room_number: e.target.value })}
                    placeholder="Room or courtroom number"
                  />
                </div>
              </div>

              {/* Outcome and Next Steps (for editing completed follow-ups) */}
              {editingFollowUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Outcome</label>
                    <textarea
                      rows={3}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                      value={newFollowUp.outcome}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, outcome: e.target.value })}
                      placeholder="What was the result of this follow-up?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Next Steps</label>
                    <textarea
                      rows={3}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-900"
                      value={newFollowUp.next_steps}
                      onChange={(e) => setNewFollowUp({ ...newFollowUp, next_steps: e.target.value })}
                      placeholder="What needs to be done next?"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                >
                  {editingFollowUp ? 'Update Follow-up' : 'Add Follow-up'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFollowUpModal(false)
                    setEditingFollowUp(null)
                  }}
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
