'use client'

export default function LawyersPage() {
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
            <a href="/lawyers" className="text-amber-200 font-semibold">Find Lawyers</a>
            <a href="/cases" className="text-gray-300 hover:text-amber-200 transition">My Cases</a>
            <a href="/tracker" className="text-gray-300 hover:text-amber-200 transition">Track Case</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">👨‍⚖️</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Find Expert Lawyers
            </h2>
            <p className="text-xl text-gray-300">
              Connect with experienced lawyers based on your case type, location, and budget
            </p>
          </div>

          {/* Search Filters */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Case Type</label>
                <select className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white backdrop-blur-sm">
                  <option className="bg-slate-800">Criminal Law</option>
                  <option className="bg-slate-800">Cyber Law</option>
                  <option className="bg-slate-800">Civil Law</option>
                  <option className="bg-slate-800">Consumer Law</option>
                  <option className="bg-slate-800">Family Law</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">City</label>
                <input
                  type="text"
                  placeholder="e.g., Bangalore"
                  className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Budget</label>
                <select className="w-full p-3 bg-white/10 border-2 border-white/20 rounded-lg focus:border-amber-400 focus:outline-none text-white backdrop-blur-sm">
                  <option className="bg-slate-800">Any</option>
                  <option className="bg-slate-800">Under ₹5,000</option>
                  <option className="bg-slate-800">₹5,000 - ₹10,000</option>
                  <option className="bg-slate-800">₹10,000 - ₹25,000</option>
                  <option className="bg-slate-800">Above ₹25,000</option>
                </select>
              </div>
            </div>
            <button className="mt-4 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 transition">
              🔍 Search Lawyers
            </button>
          </div>

          {/* Sample Lawyer Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Adv. Rajesh Kumar",
                specialization: ["Criminal Law", "Cyber Law"],
                experience: 15,
                rating: 4.8,
                cases: 250,
                winRate: 85,
                fee: "₹5,000 - ₹10,000",
                city: "Bangalore"
              },
              {
                name: "Adv. Priya Sharma",
                specialization: ["Consumer Law", "Civil Law"],
                experience: 12,
                rating: 4.6,
                cases: 180,
                winRate: 78,
                fee: "₹3,000 - ₹8,000",
                city: "Mumbai"
              },
              {
                name: "Adv. Arun Patel",
                specialization: ["Family Law", "Civil Law"],
                experience: 20,
                rating: 4.9,
                cases: 320,
                winRate: 88,
                fee: "₹8,000 - ₹15,000",
                city: "Delhi"
              },
              {
                name: "Adv. Meera Reddy",
                specialization: ["Cyber Law", "IT Act"],
                experience: 8,
                rating: 4.7,
                cases: 120,
                winRate: 82,
                fee: "₹4,000 - ₹9,000",
                city: "Hyderabad"
              }
            ].map((lawyer, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20 hover:bg-white/15 transition">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-amber-200">{lawyer.name}</h3>
                    <p className="text-sm text-gray-400">{lawyer.city} • {lawyer.experience} years exp.</p>
                  </div>
                  <div className="flex items-center space-x-1 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                    <span className="text-amber-300">⭐</span>
                    <span className="font-semibold text-amber-200">{lawyer.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {lawyer.specialization.map((spec, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-200 text-sm rounded-full border border-blue-400/30">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-300">{lawyer.cases}</div>
                    <div className="text-xs text-gray-400">Cases</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-300">{lawyer.winRate}%</div>
                    <div className="text-xs text-gray-400">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-amber-300">{lawyer.fee}</div>
                    <div className="text-xs text-gray-400">Fee Range</div>
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold rounded-lg hover:shadow-xl hover:shadow-amber-500/50 transition">
                  View Profile & Contact
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Showing 4 of 150+ lawyers in your area</p>
            <button className="px-6 py-2 border-2 border-amber-400 text-amber-200 font-semibold rounded-lg hover:bg-amber-400/10 transition">
              Load More Lawyers
            </button>
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
