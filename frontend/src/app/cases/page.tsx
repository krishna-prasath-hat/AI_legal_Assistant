'use client'

export default function CasesPage() {
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
            <a href="/cases" className="text-amber-200 font-semibold">My Cases</a>
            <a href="/tracker" className="text-gray-300 hover:text-amber-200 transition">Track Case</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-5xl mb-3">📁</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                My Cases
              </h2>
              <p className="text-xl text-gray-300">
                Track and manage all your legal cases in one place
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 transition">
              + New Case
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-blue-300">3</div>
              <div className="text-sm text-gray-400">Active Cases</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-green-300">1</div>
              <div className="text-sm text-gray-400">Resolved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-orange-300">2</div>
              <div className="text-sm text-gray-400">Pending Action</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-amber-300">5</div>
              <div className="text-sm text-gray-400">Total Cases</div>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-4">
            {[
              {
                id: "CASE-2024-001",
                title: "Cyber Fraud - Bank Account Hacking",
                type: "Cybercrime",
                status: "ongoing",
                lawyer: "Adv. Rajesh Kumar",
                nextHearing: "2024-12-15",
                progress: 60
              },
              {
                id: "CASE-2024-002",
                title: "Consumer Complaint - Defective Product",
                type: "Consumer Law",
                status: "pending_action",
                lawyer: "Adv. Priya Sharma",
                nextHearing: "2024-12-20",
                progress: 40
              },
              {
                id: "CASE-2023-045",
                title: "Property Dispute",
                type: "Civil Law",
                status: "resolved",
                lawyer: "Adv. Arun Patel",
                nextHearing: null,
                progress: 100
              }
            ].map((caseItem, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:bg-white/15 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-mono text-gray-400">{caseItem.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${caseItem.status === 'ongoing' ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' :
                        caseItem.status === 'pending_action' ? 'bg-orange-500/20 text-orange-200 border-orange-400/30' :
                          'bg-green-500/20 text-green-200 border-green-400/30'
                        }`}>
                        {caseItem.status === 'ongoing' ? '🔄 Ongoing' :
                          caseItem.status === 'pending_action' ? '⏳ Pending Action' :
                            '✅ Resolved'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-amber-200 mb-2">{caseItem.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>📋 {caseItem.type}</span>
                      <span>👨‍⚖️ {caseItem.lawyer}</span>
                      {caseItem.nextHearing && (
                        <span>📅 Next: {caseItem.nextHearing}</span>
                      )}
                    </div>
                  </div>
                  <button className="px-4 py-2 border-2 border-amber-400 text-amber-200 font-semibold rounded-lg hover:bg-amber-400/10 transition">
                    View Details
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Case Progress</span>
                    <span className="font-semibold text-amber-200">{caseItem.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 border border-white/20">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${caseItem.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
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
