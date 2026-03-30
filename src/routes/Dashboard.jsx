import { Outlet, useNavigate } from 'react-router-dom'
import { MapPinIcon, MagnifyingGlassIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth.jsx'
import MapComponent from '../components/MapComponent'
import { useState } from 'react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('routes')
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [routes, setRoutes] = useState([])
  const [destinationCoords, setDestinationCoords] = useState(null)

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      // Placeholder for route search logic; keep current behavior unchanged
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const tabs = [
    { id: 'routes', icon: MapPinIcon, label: 'Routes' },
    { id: 'traffic', icon: ClockIcon, label: 'Traffic' },
    { id: 'alerts', icon: ExclamationTriangleIcon, label: 'Alerts' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-commute-green rounded-xl flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Smart Student Commute
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-8">
        <main className="lg:col-span-8">
          {/* Search Bar */}
          <div className="card mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-6 w-6 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Where are you commuting to? (e.g. 'Stanford University')"
                className="w-full pl-14 pr-12 py-5 text-xl border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
  <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="btn-primary absolute inset-y-0 right-0 mr-2 flex items-center px-6 rounded-l-none disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search Routes'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="card p-2 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-commute-green text-commute-green'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'routes' && (
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
                  <MapPinIcon className="h-8 w-8 text-commute-green" />
                  <span>Route Options</span>
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-6 hover:scale-[1.02] transition-transform">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="font-semibold text-slate-900">Fastest Route</span>
                      </div>
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Distance</span>
                          <span className="font-bold text-2xl text-slate-900">8.2 mi</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Time</span>
                          <span className="font-bold text-2xl text-commute-green">23 min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Traffic</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Low</span>
                        </div>
                      </div>
                      <button className="btn-primary w-full">Select Route</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'traffic' && (
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Live Traffic</h3>
                <p className="text-slate-600 text-lg">Real-time congestion data loading...</p>
              </div>
            )}
            {activeTab === 'alerts' && (
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Alerts</h3>
                <p className="text-slate-600 text-lg">Traffic incidents loading...</p>
              </div>
            )}
          </div>
        </main>

  <aside className="lg:col-span-4 mt-12 lg:mt-0">
          <MapComponent routes={routes} destination={destinationCoords} />
        </aside>
      </div>
    </div>
  )
}

