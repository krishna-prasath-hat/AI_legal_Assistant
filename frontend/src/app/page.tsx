'use client'

import { useState, useEffect } from 'react'
import { getUser, logout } from '@/utils/auth'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import Header from '@/components/Header'
import { 
  Scale, 
  Check, 
  AlertTriangle, 
  Phone, 
  Shield, 
  FileText, 
  Book, 
  Lightbulb, 
  MapPin, 
  Camera, 
  Car, 
  AlertCircle, 
  X, 
  ChevronRight, 
  Activity, 
  Info,
  Clock,
  Download,
  Search,
  Users,
  ClipboardList
} from 'lucide-react'

interface AnalysisResult {
  incident_id: string
  classification: {
    offense_type: string
    offense_category: string
    severity_level: string
    confidence_score: number
    keywords: string[]
  }
  entities: Array<{
    entity_type: string
    entity_value: string
    confidence: number
  }>
  legal_sections: Array<{
    act_name: string
    section_number: string
    section_title: string
    section_description: string
    relevance_score: number
    reasoning: string
    court_fees?: string
  }>
  required_documents: string[]
  next_steps: string[]
  ai_summary: string
  previous_judgments?: Array<{
    case_title: string
    case_number: string
    court: string
    judgment_date: string
    summary: string
    relevance: string
    url?: string
  }>
}

interface AccidentClaimData {
  // Policy & Insured Details
  policy_number: string
  insured_name: string
  insured_address: string
  insured_phone: string
  insured_email: string
  
  // Vehicle Details
  vehicle_registration: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: string
  engine_number: string
  chassis_number: string
  odometer_reading: string
  
  // Accident Details
  accident_date: string
  accident_time: string
  accident_location: string
  accident_description: string
  injury_details: string
  vehicle_speed_estimate: string
  impact_point: string
  damage_photos: any // For now just to hold file object or name
  damage_description: string
  damage_percentage: string
  
  // Driver Details
  driver_name: string
  driver_license_number: string
  driver_license_validity: string
  driver_relationship: string
  
  // Other Vehicle Details (if applicable)
  other_vehicle_registration: string
  other_vehicle_make: string
  other_vehicle_model: string
  other_driver_name: string
  other_driver_phone: string
  other_insurance_company: string
  other_policy_number: string
  
  // Police & Legal
  fir_number: string
  police_station: string
  witness_name: string
  witness_phone: string
  
  // Repair Details
  garage_name: string
  garage_address: string
  estimated_repair_cost: string
  
  // Location Proof
  latitude?: number
  longitude?: number
  location_timestamp?: string
}

export default function HomePage() {
  const [incidentText, setIncidentText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  
  // Accident Insurance Claim States
  const [showAccidentModal, setShowAccidentModal] = useState(false)
  const [accidentClaimData, setAccidentClaimData] = useState<AccidentClaimData>({
    policy_number: '',
    insured_name: '',
    insured_address: '',
    insured_phone: '',
    insured_email: '',
    vehicle_registration: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    engine_number: '',
    chassis_number: '',
    odometer_reading: '',
    accident_date: '',
    accident_time: '',
    accident_location: '',
    accident_description: '',
    injury_details: '',
    vehicle_speed_estimate: '',
    impact_point: '',
    damage_photos: null,
    damage_description: '',
    damage_percentage: '',
    driver_name: '',
    driver_license_number: '',
    driver_license_validity: '',
    driver_relationship: 'owner',
    other_vehicle_registration: '',
    other_vehicle_make: '',
    other_vehicle_model: '',
    other_driver_name: '',
    other_driver_phone: '',
    other_insurance_company: '',
    other_policy_number: '',
    fir_number: '',
    police_station: '',
    witness_name: '',
    witness_phone: '',
    garage_name: '',
    garage_address: '',
    estimated_repair_cost: ''
  })
  const [accidentAnalysisResult, setAccidentAnalysisResult] = useState<any>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const handleAnalyze = async () => {
    if (!incidentText.trim() || incidentText.length < 50) {
      alert('Please describe your incident in at least 50 characters')
      return
    }

    setIsAnalyzing(true)
    
    // Attempt to detect location for better context (Police Station recommendation)
    let coords: {lat: number, lng: number} | null = null
    if ('geolocation' in navigator) {
       try {
         const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {timeout: 4000}) 
         })
         coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
       } catch (e) {
         console.log("Location detection skipped")
       }
    }

    try {
      const payload: any = {
          incident_text: incidentText,
          is_anonymous: true
      }
      if (coords) {
          payload.user_lat = coords.lat
          payload.user_lng = coords.lng
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/legal/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Analysis result:', data)
        setAnalysisResult(data)
        setShowResults(true)
      } else {
        const error = await response.json()
        alert(`Analysis failed: ${error.detail || 'Please try again'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to connect to server. Make sure the backend is running.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Check if the incident is an accident
  const isAccidentCase = (result: AnalysisResult | null): boolean => {
    if (!result) return false
    const text = incidentText.toLowerCase()
    const category = result.classification.offense_category?.toLowerCase() || ''
    const type = result.classification.offense_type?.toLowerCase() || ''
    
    const isVehicleRelated = text.includes('vehicle') || 
                             text.includes('car') || 
                             text.includes('bike') || 
                             text.includes('motor') ||
                             text.includes('driving') ||
                             text.includes('traffic')

    const isAccidentTerm = text.includes('accident') || 
                           text.includes('collision') ||
                           text.includes('crash')
    
    // "Hit" analysis: "Hit" alone is ambiguous (could be assault). 
    // Only count "hit" if it's "hit and run" or associated with a vehicle.
    const isHitAndRun = text.includes('hit and run') || (text.includes('hit') && isVehicleRelated)

    // Explicitly exclude if it's purely assault unless it involves a vehicle accident
    if ((type.includes('assault') || type.includes('battery')) && !isVehicleRelated && !isAccidentTerm) {
        return false
    }

    return isAccidentTerm || 
           ((category.includes('accident') || type.includes('accident')) && isVehicleRelated) ||
           isHitAndRun
  }

  // Capture current location for accident proof
  const captureAccidentLocation = async () => {
    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true,
            timeout: 10000 
          })
        })
        
        setAccidentClaimData(prev => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          location_timestamp: new Date().toISOString(),
          accident_location: prev.accident_location || `Lat: ${pos.coords.latitude.toFixed(6)}, Lng: ${pos.coords.longitude.toFixed(6)}`
        }))
        
        alert('Location captured successfully!')
      } catch (error) {
        alert('Unable to capture location. Please enable location services or enter manually.')
      }
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  // Handle accident claim submission
  const handleAccidentClaimSubmit = async () => {
    // Validate required fields
    if (!accidentClaimData.policy_number || !accidentClaimData.vehicle_registration || 
        !accidentClaimData.accident_date || !accidentClaimData.damage_description) {
      alert('Please fill in all required fields (Policy Number, Vehicle Registration, Accident Date, Damage Description)')
      return
    }

    // Simulating AI Analysis (Local Logic for instant feedback)
    console.log("Analyzing accident claim locally...")
    
    // Basic logic for mock analysis
      const hasInjury = accidentClaimData.injury_details && accidentClaimData.injury_details.length > 5;
      const isFatal = accidentClaimData.injury_details && (accidentClaimData.injury_details.toLowerCase().includes('death') || accidentClaimData.injury_details.toLowerCase().includes('fatal') || accidentClaimData.injury_details.toLowerCase().includes('died'));
      const isMajorDamage = accidentClaimData.damage_percentage === 'major' || accidentClaimData.damage_percentage === 'total';
      const severity = isFatal ? 'Critical (Fatal)' : (hasInjury || isMajorDamage ? 'Major' : (accidentClaimData.damage_percentage === 'moderate' ? 'Moderate' : 'Minor'));
      
      // Always apply BNS (Bharatiya Nyaya Sanhita) as per latest standards
      const legalSections = [];
      const lawLabel = 'BNS (Bharatiya Nyaya Sanhita) Sections';
      
      legalSections.push('281 (Rash driving or riding on public way)'); 
      if (hasInjury && !isFatal) legalSections.push('125(a) (Act endangering life - Hurt)'); 
      if (isMajorDamage && hasInjury && !isFatal) legalSections.push('125(b) (Act endangering life - Grievous Hurt)');
      if (isFatal) {
           legalSections.push('106(1) (Causing death by negligence)');
           legalSections.push('106(2) (Hit and Run - Increased Penalty)');
      }
      
      const mvSections = ['184 (Dangerous Driving)'];
      if (hasInjury) mvSections.push('134 (Duty of Driver in case of accident)');
      
      // Calculate estimated claim amount (approx 85% settlement after depreciation - 1000 deductible)
      let claimAmountDisplay = 'To be assessed by surveyor';
      if (accidentClaimData.estimated_repair_cost) {
          const cost = parseFloat(accidentClaimData.estimated_repair_cost.replace(/[^0-9.]/g, ''));
          if (!isNaN(cost) && cost > 0) {
              const estimatedSettlement = Math.max(0, Math.round((cost * 0.85) - 1000));
              claimAmountDisplay = `≈ ₹ ${estimatedSettlement} (Subject to depreciation & deductibles)`;
          } else {
              claimAmountDisplay = accidentClaimData.estimated_repair_cost;
          }
      }

      setAccidentAnalysisResult({
        severity_level: severity,
        legal_provisions: {
           ipc_sections: legalSections,
           ipc_label: lawLabel, // New field to pass the dynamic label
           mv_act_sections: mvSections,
           compensation_laws: hasInjury ? "Section 166 of MV Act (Compensation for death/injury)" : "Own Damage (OD) Claim under Insurance Policy",
           fir_status: hasInjury || isMajorDamage ? "Mandatory (First Information Report)" : "NCR (Non-Cognizable Report) usually sufficient for minor damage only"
        },
        claim_summary: `Based on the provided information, this appears to be a ${severity} accident case. ${hasInjury ? 'Since injuries are reported, immediate medical attention and police reporting are critical.' : 'As it involves property damage, ensuring proper documentation is key for insurance.'}`,
        estimated_claim_amount: claimAmountDisplay,
        required_documents: [
          'Duly filled and signed claim form',
          'Copy of insurance policy',
          'Copy of RC and driving license',
          hasInjury ? 'Medical Report / Discharge Summary' : null,
          (hasInjury || isMajorDamage) ? 'FIR Copy (Mandatory)' : 'Police CSR / NCR / FIR Copy',
          'repair estimates from authorized garage',
          'Photographs of damage (captured)',
          'Original repair bills and receipts'
        ].filter(Boolean),
        next_steps: [
          'Ensure safety and medical aid if needed',
          (hasInjury || isMajorDamage) ? 'File an FIR at the nearest police station immediately' : 'Report to police and get an entry (NCR/CSR)',
          'Intimate insurance company within 24 hours',
          'Do not move vehicle if major accident (take photos first)',
          'Submit vehicle for survey and repairs'
        ],
        tips: [
          'Do not admit liability immediately at the scene',
          'Note down contact details of witnesses',
          'Take clear photos of the other vehicle\'s number plate',
          'Keep copies of all submitted documents'
        ]
      })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />

      {/* Breathing Exercise Banner */}
      {showBreathing && (
        <div className="bg-green-50 border-b-2 border-green-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900 text-lg">Take a Deep Breath</h3>
                  <p className="text-green-700">Breathe in (4s) → Hold (4s) → Breathe out (4s)</p>
                </div>
              </div>
              <button
                onClick={() => setShowBreathing(false)}
                className="text-green-700 hover:text-green-900 font-semibold"
              >
                <span className="flex items-center gap-2">I'm Ready <Check className="w-4 h-4" /></span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Reassuring Message */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4 px-6 py-3 bg-blue-100 rounded-full">
              <p className="text-blue-800 font-semibold flex items-center justify-center gap-2"><Check className="w-4 h-4" /> You're in the right place</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              We're Here to Help You
            </h2>
          </div>

          {/* Emergency Contacts - Prominent */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-bold text-red-900 text-lg mb-1">In Immediate Danger?</h3>
                <p className="text-red-700 mb-3">Call emergency services first, then we can help with legal guidance</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <a href="tel:100" className="bg-white px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 transition text-center">
                <div className="font-bold text-red-600 text-xl">100</div>
                <div className="text-xs text-gray-600">Police</div>
              </a>
              <a href="tel:1091" className="bg-white px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 transition text-center">
                <div className="font-bold text-red-600 text-xl">1091</div>
                <div className="text-xs text-gray-600">Women Helpline</div>
              </a>
              <a href="tel:1930" className="bg-white px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 transition text-center">
                <div className="font-bold text-red-600 text-xl">1930</div>
                <div className="text-xs text-gray-600">Cyber Crime</div>
              </a>
              <a href="tel:1098" className="bg-white px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 transition text-center">
                <div className="font-bold text-red-600 text-xl">1098</div>
                <div className="text-xs text-gray-600">Child Helpline</div>
              </a>
            </div>
          </div>

          {/* Main Input Card - Simplified */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-blue-100">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Tell Us What Happened</h3>
              <p className="text-gray-600">
                Don't worry about legal terms. Just describe in your own words.
              </p>
            </div>

            {/* Character Counter - Visual */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Description</span>
                <span className={`text-sm font-semibold ${incidentText.length >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                  {incidentText.length >= 50 ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span> : `${50 - incidentText.length} more characters needed`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all ${incidentText.length >= 50 ? 'bg-green-500' : 'bg-orange-400'}`}
                  style={{ width: `${Math.min((incidentText.length / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <textarea
              value={incidentText}
              onChange={(e) => setIncidentText(e.target.value)}
              placeholder="Example: Someone called me pretending to be from my bank and asked for my OTP. They transferred money from my account..."
              className="w-full h-48 p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-gray-800 placeholder-gray-400 text-lg"
              minLength={50}
              maxLength={5000}
            />

            {/* Large, Clear CTA Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || incidentText.length < 50}
              className="w-full mt-6 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xl rounded-xl hover:shadow-2xl hover:scale-105 transform transition disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center space-x-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing Your Situation...</span>
                </span>
              ) : (
                  <span className="flex items-center justify-center space-x-2">
                  <Scale className="w-5 h-5" />
                  <span>Get Legal Guidance Now</span>
                  <ChevronRight className="w-5 h-5" />
                </span>
              )}
            </button>

            {/* Trust Indicators */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="text-green-500 w-5 h-5" />
                <span>100% Confidential</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="text-green-500 w-5 h-5" />
                <span>Free Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="text-green-500 w-5 h-5" />
                <span>Instant Help</span>
              </div>
            </div>
          </div>

          {/* Simple 3-Step Process */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              How It Works - 3 Simple Steps
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-3xl font-bold">1</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Describe</h4>
                <p className="text-gray-600">Tell us what happened in simple words</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-3xl font-bold">2</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Understand</h4>
                <p className="text-gray-600">Get clear legal guidance instantly</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white text-3xl font-bold">3</span>
                </div>
                <h4 className="font-bold text-gray-800 mb-2 text-lg">Act</h4>
                <p className="text-gray-600">Connect with lawyers and take action</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-3"><Scale className="w-10 h-10 text-white" /></div>
          <p className="text-gray-300 mb-2">© 2025 JustiFly - AI Legal Assistance Platform</p>
          <p className="text-xs text-gray-400">
            This platform provides general legal information. For specific legal advice, please consult a qualified lawyer.
          </p>
        </div>
      </footer>

      {/* Results Modal */}
      {showResults && analysisResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">Legal Analysis Complete <Check className="w-6 h-6" /></h2>
                  <p className="text-blue-100">Powered by AI • Incident ID: {analysisResult.incident_id}</p>
                </div>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Classification */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                <h3 className="font-bold text-blue-900 text-lg mb-3 flex items-center">
                  <span className="mr-2"><Search className="w-5 h-5 inline" /></span> Classification
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Offense Type</p>
                    <p className="font-bold text-gray-800 capitalize">{analysisResult.classification.offense_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-bold text-gray-800 capitalize">{analysisResult.classification.offense_category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Severity</p>
                    <p className={`font-bold capitalize ${
                      analysisResult.classification.severity_level === 'high' ? 'text-red-600' :
                      analysisResult.classification.severity_level === 'medium' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>{analysisResult.classification.severity_level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="font-bold text-gray-800">{(analysisResult.classification.confidence_score * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>

              {/* Next Steps - MOVED TO FIRST */}
              {analysisResult.next_steps && analysisResult.next_steps.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                  <h3 className="font-bold text-yellow-900 text-lg mb-3 flex items-center">
                    <span className="mr-2"><Check className="w-5 h-5 inline" /></span> Recommended Next Steps
                  </h3>
                  <ol className="space-y-2">
                    {analysisResult.next_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* AI Summary - MOVED TO SECOND */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                <h3 className="font-bold text-green-900 text-lg mb-3 flex items-center">
                  <span className="mr-2"><Activity className="w-5 h-5 inline" /></span> AI Analysis Summary
                </h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-gray-800 mt-3 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-bold text-blue-800 mt-4 mb-2 border-b pb-1" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-base font-bold text-blue-700 mt-2 mb-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-indigo-900" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2 pl-2" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-3" {...props} />
                    }}
                  >
                    {analysisResult.ai_summary}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Previous Judgments - NEW SECTION */}
              {analysisResult.previous_judgments && analysisResult.previous_judgments.length > 0 && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-5">
                  <h3 className="font-bold text-indigo-900 text-lg mb-4 flex items-center">
                    <span className="mr-2"><Book className="w-5 h-5 inline" /></span> Relevant Previous Judgments
                  </h3>
                  <p className="text-sm text-indigo-700 mb-4">
                    Based on similar cases, here are relevant judgments from Indian courts that may help understand how such cases have been decided:
                  </p>
                  <div className="space-y-4">
                    {analysisResult.previous_judgments.map((judgment, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-indigo-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-indigo-900 flex-1">
                            {judgment.case_title}
                          </h4>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                            {judgment.court}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <span className="font-medium">{judgment.case_number}</span>
                          <span>•</span>
                          <span>{judgment.judgment_date}</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{judgment.summary}</p>
                        <p className="text-sm text-indigo-700 italic mb-2">
                          <strong>Relevance:</strong> {judgment.relevance}
                        </p>
                        {judgment.url && (
                          <a
                            href={judgment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          >
                            <span>View Full Judgment</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Sections */}
              {analysisResult.legal_sections && analysisResult.legal_sections.length > 0 && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                  <h3 className="font-bold text-purple-900 text-lg mb-4 flex items-center">
                    <span className="mr-2"><Scale className="w-5 h-5 inline" /></span> Applicable Legal Sections
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.legal_sections.map((section, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-purple-900">
                            {section.act_name} Section {section.section_number}
                          </h4>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {(section.relevance_score * 100).toFixed(0)}% relevant
                          </span>
                        </div>
                        <p className="font-semibold text-gray-800 mb-2">{section.section_title}</p>
                        <p className="text-sm text-gray-600 mb-2">{section.section_description}</p>
                        <p className="text-sm text-purple-700 italic mb-2">{section.reasoning}</p>
                        {section.court_fees && (
                          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 flex items-center">
                            <span className="font-semibold text-gray-900 mr-2 flex items-center gap-1"><Scale className="w-4 h-4" /> Approx Court Fees:</span> 
                            <span>{section.court_fees}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities */}
              {analysisResult.entities && analysisResult.entities.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
                  <h3 className="font-bold text-orange-900 text-lg mb-3 flex items-center">
                    <span className="mr-2"><ClipboardList className="w-5 h-5 inline" /></span> Key Information Extracted
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.entities.map((entity, idx) => (
                      <div key={idx} className="bg-white rounded-lg px-3 py-2 border border-orange-200">
                        <p className="text-xs text-gray-600">{entity.entity_type}</p>
                        <p className="font-semibold text-gray-800">{entity.entity_value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents */}
              {analysisResult.required_documents && analysisResult.required_documents.length > 0 && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
                    <span className="mr-2"><FileText className="w-5 h-5 inline" /></span> Required Documents
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.required_documents.map((doc, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <Check className="text-green-500 w-4 h-4 mr-2" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={async () => {
                    try {
                      // Call Backend to generated smart draft
                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/legal/draft-fir`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          incident_id: analysisResult.incident_id,
                          user_name: user?.name || '[Your Name]',
                          user_address: '[Your Address]',
                          user_phone: '[Your Phone]',
                          incident_text: incidentText,
                          legal_sections: analysisResult.legal_sections
                        })
                      })

                      if (response.ok) {
                        const data = await response.json()
                        
                        // Create Blob and Download
                        const element = document.createElement("a");
                        const file = new Blob([data.fir_draft], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = "Complaint_Draft.txt";
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                        
                        // Optional: Also copy to clipboard for convenience?
                        // navigator.clipboard.writeText(data.fir_draft)
                        alert('Complaint Draft Downloaded Successfully!')
                      } else {
                        const err = await response.json()
                        alert(`Failed to generate draft: ${err.detail}`)
                      }
                    } catch (error) {
                      console.error('Error:', error)
                      alert('Failed to connect to server for FIR generation.')
                    }
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <span className="text-xl"><Download className="w-6 h-6" /></span>
                  <span>Download Complaint Draft</span>
                </button>
                
                <button
                  onClick={() => {
                     const category = analysisResult.classification.offense_category?.toLowerCase() || ''
                     let practiceArea = ''
                     if (category.includes('criminal') || category.includes('theft') || category.includes('assault')) practiceArea = 'Criminal Law'
                     else if (category.includes('civil') || category.includes('property')) practiceArea = 'Civil Law'
                     else if (category.includes('family') || category.includes('divorce') || category.includes('domestic')) practiceArea = 'Family Law'
                     else if (category.includes('consumer')) practiceArea = 'Consumer Law'
                     else if (category.includes('cyber') || category.includes('internet')) practiceArea = 'Cyber Law'
                     
                     const cityEntity = analysisResult.entities.find((e: any) => e.entity_type === 'LOCATION')
                     const city = cityEntity ? cityEntity.entity_value : ''
                     
                     const params = new URLSearchParams()
                     if (practiceArea) params.append('practice_area', practiceArea)
                     if (city) params.append('city', city)
                     
                     router.push(`/lawyers?${params.toString()}`)
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <span className="text-xl"><Users className="w-6 h-6" /></span>
                  <span>Find Lawyers</span>
                </button>

                {/* Accident Insurance Claim Button - Only show if it's an accident case */}
                {isAccidentCase(analysisResult) && (
                  <button
                    onClick={() => setShowAccidentModal(true)}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl"><Car className="w-6 h-6" /></span>
                    <span>Insurance Claim Analyse</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accident Insurance Claim Modal */}
      {showAccidentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Car className="w-6 h-6" /> Vehicle Accident Document Analysis</h2>
                  <p className="text-orange-100">Fill in the details to get AI-powered claim guidance</p>
                </div>
                <button
                  onClick={() => {
                    setShowAccidentModal(false)
                    setAccidentAnalysisResult(null)
                  }}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!accidentAnalysisResult ? (
                <form onSubmit={(e) => { e.preventDefault(); handleAccidentClaimSubmit(); }} className="space-y-6">
                  {/* Policy & Insured Details */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <h3 className="font-bold text-blue-900 text-lg mb-4 flex items-center">
                      <span className="mr-2"><ClipboardList className="w-5 h-5 inline" /></span> Policy & Insured Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Policy Number *</label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.policy_number}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, policy_number: e.target.value})}
                          placeholder="Enter your policy number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Insured Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.insured_name}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, insured_name: e.target.value})}
                          placeholder="Full name as per policy"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.insured_phone}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, insured_phone: e.target.value})}
                          placeholder="+91 XXXXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                        <input
                          type="email"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.insured_email}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, insured_email: e.target.value})}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
                        <input
                          type="text"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.insured_address}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, insured_address: e.target.value})}
                          placeholder="Complete address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                    <h3 className="font-bold text-purple-900 text-lg mb-4 flex items-center">
                      <span className="mr-2"><Car className="w-5 h-5 inline" /></span> Your Vehicle Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Registration Number *</label>
                        <input
                          type="text"
                          required
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900 uppercase"
                          value={accidentClaimData.vehicle_registration}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, vehicle_registration: e.target.value.toUpperCase()})}
                          placeholder="TN01AB1234"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Make & Model *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                            value={accidentClaimData.vehicle_make}
                            onChange={(e) => setAccidentClaimData({...accidentClaimData, vehicle_make: e.target.value})}
                            placeholder="Make (e.g., Maruti)"
                          />
                          <input
                            type="text"
                            required
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                            value={accidentClaimData.vehicle_model}
                            onChange={(e) => setAccidentClaimData({...accidentClaimData, vehicle_model: e.target.value})}
                            placeholder="Model (e.g., Swift)"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Year</label>
                        <input
                          type="text"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.vehicle_year}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, vehicle_year: e.target.value})}
                          placeholder="2020"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Odometer Reading (km)</label>
                        <input
                          type="text"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.odometer_reading}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, odometer_reading: e.target.value})}
                          placeholder="Current km reading"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Engine Number</label>
                        <input
                          type="text"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.engine_number}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, engine_number: e.target.value})}
                          placeholder="As per RC"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Chassis Number</label>
                        <input
                          type="text"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.chassis_number}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, chassis_number: e.target.value})}
                          placeholder="As per RC"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accident Details */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                    <h3 className="font-bold text-red-900 text-lg mb-4 flex items-center">
                      <span className="mr-2"><AlertCircle className="w-5 h-5 inline" /></span> Accident Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Accident Date *</label>
                        <input
                          type="date"
                          required
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.accident_date}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, accident_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Accident Time</label>
                        <input
                          type="time"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.accident_time}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, accident_time: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Accident Location</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                            value={accidentClaimData.accident_location}
                            onChange={(e) => setAccidentClaimData({...accidentClaimData, accident_location: e.target.value})}
                            placeholder="Exact location of accident"
                          />
                          <button
                            type="button"
                            onClick={captureAccidentLocation}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold whitespace-nowrap"
                          >
                            <MapPin className="w-4 h-4 inline mr-1" /> Capture Location
                          </button>
                        </div>
                        {accidentClaimData.latitude && accidentClaimData.longitude && (
                          <p className="text-xs text-green-600 mt-1">
                            <Check className="w-3 h-3 inline" /> Location captured: {accidentClaimData.latitude.toFixed(6)}, {accidentClaimData.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">How did the accident happen? *</label>
                        <textarea
                          required
                          rows={3}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.accident_description}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, accident_description: e.target.value})}
                          placeholder="Describe the accident in detail..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Injury Details</label>
                        <textarea
                          rows={2}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.injury_details}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, injury_details: e.target.value})}
                          placeholder="Describe any injuries sustained by drivers, passengers, or pedestrians..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Vehicle Speed Estimate (km/h)</label>
                          <input
                            type="text"
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                            value={accidentClaimData.vehicle_speed_estimate}
                            onChange={(e) => setAccidentClaimData({...accidentClaimData, vehicle_speed_estimate: e.target.value})}
                            placeholder="e.g., 40-50 km/h"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Point of Impact</label>
                          <select
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                            value={accidentClaimData.impact_point}
                            onChange={(e) => setAccidentClaimData({...accidentClaimData, impact_point: e.target.value})}
                          >
                            <option value="">Select impact point</option>
                            <option value="front">Front Impact</option>
                            <option value="rear">Rear Impact</option>
                            <option value="left_side">Left Side</option>
                            <option value="right_side">Right Side</option>
                            <option value="multiple">Multiple Points</option>
                            <option value="rollover">Rollover</option>
                          </select>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-900 mb-2">Damage Photos</label>
                         <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:bg-orange-50 transition cursor-pointer relative">
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={(e) => {
                                 const files = e.target.files;
                                 if(files && files.length > 0) {
                                    setAccidentClaimData({...accidentClaimData, damage_photos: files})
                                 }
                              }}
                            />
                            <span className="mb-2"><Camera className="w-8 h-8" /></span>
                            <span className="font-semibold">Click to Upload Photos</span>
                            <span className="text-xs mt-1">
                               {accidentClaimData.damage_photos && accidentClaimData.damage_photos.length > 0 
                                  ? <span className="flex items-center gap-1"><Check className="w-3 h-3" /> {accidentClaimData.damage_photos.length} photos selected</span> 
                                  : "Supported: JPG, PNG (Max 5MB)"}
                            </span>
                         </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">Damage Description *</label>
                        <textarea
                          required
                          rows={3}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.damage_description}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, damage_description: e.target.value})}
                          placeholder="Describe all damages to your vehicle (e.g., front bumper damaged, headlight broken, etc.)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Estimated Damage %</label>
                        <select
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.damage_percentage}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, damage_percentage: e.target.value})}
                        >
                          <option value="">Select damage level</option>
                          <option value="minor">Minor (0-25%)</option>
                          <option value="moderate">Moderate (25-50%)</option>
                          <option value="major">Major (50-75%)</option>
                          <option value="total">Total Loss (75-100%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Estimated Repair Cost (₹)</label>
                        <input
                          type="text"
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none text-gray-900"
                          value={accidentClaimData.estimated_repair_cost}
                          onChange={(e) => setAccidentClaimData({...accidentClaimData, estimated_repair_cost: e.target.value})}
                          placeholder="Approximate cost"
                        />
                      </div>
                    </div>
                  </div>



                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-lg rounded-xl hover:shadow-lg transition"
                    >
                      <Activity className="w-5 h-5 inline mr-2" /> Get AI Claim Analysis
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAccidentModal(false)
                        setAccidentAnalysisResult(null)
                      }}
                      className="px-6 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Accident Claim Analysis Results */
                <div className="space-y-6">
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                    <h3 className="font-bold text-green-900 text-lg mb-3 flex items-center">
                      <span className="mr-2"><Check className="w-5 h-5 inline" /></span> Claim Analysis Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{accidentAnalysisResult.claim_summary}</p>
                    {accidentAnalysisResult.estimated_claim_amount && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-green-300">
                        <p className="text-sm text-gray-600">Estimated Claim Amount</p>
                        <p className="text-xl font-bold text-green-700">{accidentAnalysisResult.estimated_claim_amount}</p>
                      </div>
                    )}
                  </div>

                  {/* Legal Assessment Section */}
                  {accidentAnalysisResult.legal_provisions && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                      <h3 className="font-bold text-red-900 text-lg mb-3 flex items-center">
                        <span className="mr-2"><Scale className="w-5 h-5 inline" /></span> Legal Assessment
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-red-100">
                           <p className="text-xs font-bold text-red-500 uppercase">Severity Level</p>
                           <p className="font-bold text-gray-800 text-lg">{accidentAnalysisResult.severity_level}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-red-100">
                           <p className="text-xs font-bold text-red-500 uppercase">FIR Requirement</p>
                           <p className="font-bold text-gray-800">{accidentAnalysisResult.legal_provisions.fir_status}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">{accidentAnalysisResult.legal_provisions.ipc_label || "Applicable BNS Sections"}:</p>
                          <div className="flex flex-wrap gap-2">
                            {accidentAnalysisResult.legal_provisions.ipc_sections.map((sec: string, idx: number) => (
                              <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium border border-red-200">
                                BNS {sec}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Motor Vehicles Act Sections:</p>
                          <div className="flex flex-wrap gap-2">
                            {accidentAnalysisResult.legal_provisions.mv_act_sections.map((sec: string, idx: number) => (
                              <span key={idx} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium border border-orange-200">
                                MV Act {sec}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-red-100 mt-2">
                           <p className="text-xs font-bold text-red-500 uppercase mb-1">Compensation / Liability Laws</p>
                           <p className="text-sm text-gray-700">{accidentAnalysisResult.legal_provisions.compensation_laws}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
                    <h3 className="font-bold text-blue-900 text-lg mb-3 flex items-center">
                      <span className="mr-2"><FileText className="w-5 h-5 inline" /></span> Required Documents
                    </h3>
                    <ul className="space-y-2">
                      {accidentAnalysisResult.required_documents?.map((doc: string, idx: number) => (
                        <li key={idx} className="flex items-start text-gray-700">
                          <Check className="text-green-500 mr-2 mt-1 w-4 h-4" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                    <h3 className="font-bold text-yellow-900 text-lg mb-3 flex items-center">
                      <span className="mr-2"><ClipboardList className="w-5 h-5 inline" /></span> Next Steps
                    </h3>
                    <ol className="space-y-2">
                      {accidentAnalysisResult.next_steps?.map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                    <h3 className="font-bold text-purple-900 text-lg mb-3 flex items-center">
                      <span className="mr-2"><Lightbulb className="w-5 h-5 inline" /></span> Important Tips
                    </h3>
                    <ul className="space-y-2">
                      {accidentAnalysisResult.tips?.map((tip: string, idx: number) => (
                        <li key={idx} className="flex items-start text-gray-700">
                          <span className="text-purple-500 mr-2 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {accidentClaimData.latitude && accidentClaimData.longitude && (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-3 flex items-center">
                        <span className="mr-2"><MapPin className="w-5 h-5 inline" /></span> Location Proof Captured
                      </h3>
                      <p className="text-gray-700">
                        Coordinates: {accidentClaimData.latitude.toFixed(6)}, {accidentClaimData.longitude.toFixed(6)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Timestamp: {accidentClaimData.location_timestamp ? new Date(accidentClaimData.location_timestamp).toLocaleString() : 'N/A'}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${accidentClaimData.latitude},${accidentClaimData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View on Google Maps →
                      </a>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowAccidentModal(false)
                        setAccidentAnalysisResult(null)
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg transition"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => setAccidentAnalysisResult(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
                    >
                      ← Back to Form
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
