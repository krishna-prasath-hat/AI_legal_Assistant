'use client'

import { useState, useRef, useEffect } from 'react'
import { getUser } from '@/utils/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Clock, AlertTriangle, Shield, CheckCircle } from 'lucide-react'

interface Message {
  role: 'bot' | 'user'
  content: string
}

interface Slot {
  id: string
  time: string
  date: string
  type: string
  timestamp: string
}

interface IntakeResult {
  severity_score: number
  urgency_level: string
  brief_summary: string
  recommended_slot_type: string
  available_slots: Slot[]
}

interface LawyerChatModalProps {
  isOpen: boolean
  onClose: () => void
  lawyer: {
    id: number
    full_name: string
    practice_areas: string[]
  }
}

export default function LawyerChatModal({ isOpen, onClose, lawyer }: LawyerChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [intakeResult, setIntakeResult] = useState<IntakeResult | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Initial Greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { 
          role: 'bot', 
          content: `Hello! I am the virtual intake assistant for Adv. ${lawyer.full_name}. I can help you schedule an appointment. To confirm availability, I need to ask 3 quick questions.` 
        },
        {
          role: 'bot',
          content: "First, what type of legal issue are you facing? (e.g., Criminal, Property, Divorce, Cyber Check)"
        }
      ])
      setStep(1)
    }
  }, [isOpen, lawyer])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: inputValue }]
    setMessages(newMessages)
    setInputValue('')
    setLoading(true)

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600))

    if (step === 1) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I see. Please briefly describe the incident or situation. What happened?" 
      }])
      setStep(2)
    } else if (step === 2) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Understood. On a scale of 1 to 10, how urgent is this matter? (10 being immediate emergency)" 
      }])
      setStep(3)
    } else if (step === 3) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "Thank you. Analyzing your case severity and checking Adv. " + lawyer.full_name + "'s availability..." 
      }])
      
      // Call API
      try {
        const response = await fetch(`${API_URL}/api/v1/lawyers/${lawyer.id}/analyze-intake`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_history: newMessages })
        })
        
        if (response.ok) {
          const data = await response.json()
          setIntakeResult(data)
          setStep(4)
        } else {
          setMessages(prev => [...prev, { role: 'bot', content: "I apologize, I'm having trouble connecting to the scheduler. Please try calling the office directly." }])
        }
      } catch (e) {
        console.error(e)
        setMessages(prev => [...prev, { role: 'bot', content: "An error occurred. Please try again." }])
      }
    }
    setLoading(false)
  }

  const handleBook = async () => {
    if (!selectedSlot || !intakeResult) return

    const slot = intakeResult.available_slots.find(s => s.id === selectedSlot)
    if (!slot) return

    const user = getUser()
    if (!user) {
        // Fallback for demo if no user logged in
        alert("Please login to book an appointment")
        return
    }

    try {
        const response = await fetch(`${API_URL}/api/v1/lawyers/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: String(user.id || user.email || 'guest'), 
                user_name: user.name || 'Guest User',
                user_email: user.email,
                lawyer_id: lawyer.id,
                appointment_date: slot.date,
                slot_time: slot.time,
                appointment_type: slot.type,
                mode: "Video Call",
                notes: intakeResult.brief_summary
            })
        })

        if (response.ok) {
            setBookingConfirmed(true)
            setTimeout(() => {
                onClose()
                // Reset state after close
                setTimeout(() => {
                    setMessages([])
                    setStep(0)
                    setIntakeResult(null)
                    setBookingConfirmed(false)
                    setSelectedSlot(null)
                }, 500)
            }, 3000)
        } else {
             alert('Failed to book appointment. Please try again.')
        }
    } catch (e) {
        console.error("Booking error:", e)
        alert('An error occurred while booking.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                    <h3 className="font-bold">Adv. {lawyer.full_name}</h3>
                    <p className="text-xs text-blue-200">Legal Assistant Bot</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 min-h-[300px]">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[80%] p-3 rounded-2xl ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                        }`}
                    >
                        {msg.content}
                    </div>
                </div>
            ))}
            
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-200">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                </div>
            )}

            {/* Results & Booking UI */}
            {intakeResult && !bookingConfirmed && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 mt-4"
                >
                    {/* Analysis Summary */}
                    <div className={`p-4 rounded-xl border-l-4 ${intakeResult.severity_score >= 8 ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'}`}>
                        <div className="flex items-start justify-between mb-2">
                             <div className="flex items-center space-x-2">
                                <AlertTriangle className={`w-4 h-4 ${intakeResult.severity_score >= 8 ? 'text-red-600' : 'text-blue-600'}`} />
                                <span className={`text-sm font-bold ${intakeResult.severity_score >= 8 ? 'text-red-700' : 'text-blue-700'}`}>
                                    Assessment: {intakeResult.urgency_level} Priority
                                </span>
                             </div>
                        </div>
                        <p className="text-sm text-gray-700 italic">"{intakeResult.brief_summary}"</p>
                    </div>

                    {/* Slots */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Available Slots ({intakeResult.available_slots.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {intakeResult.available_slots.map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setSelectedSlot(slot.id)}
                                    className={`p-3 rounded-lg border text-sm text-left transition ${
                                        selectedSlot === slot.id
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                        : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                    }`}
                                >
                                    <div className="font-bold">{slot.date}</div>
                                    <div>{slot.time}</div>
                                    <div className="text-xs opacity-80 mt-1">{slot.type}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={!selectedSlot}
                        onClick={handleBook}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition"
                    >
                        Confirm Appointment
                    </button>
                </motion.div>
            )}

            {bookingConfirmed && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center bg-green-50 rounded-2xl border border-green-200"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Appointment Confirmed!</h3>
                    <p className="text-green-700 mb-4">You will receive a confirmation email shortly.</p>
                    <p className="text-xs text-gray-500">Closing window...</p>
                </motion.div>
            )}

            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!intakeResult && (
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your answer..."
                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
      </motion.div>
    </div>
  )
}
