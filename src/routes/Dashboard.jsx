import { Outlet, useNavigate } from 'react-router-dom'
import { MapPinIcon, MagnifyingGlassIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../hooks/useAuth.jsx'
import MapComponent from '../components/MapComponent'
import { getRoutes, getCurrentLocation } from '../services/leaflet.js'
import { geocodeAddress } from '../utils/geocode.js'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('routes')
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [routes, setRoutes] = useState([])
  const [destinationCoords, setDestinationCoords] = useState(null)

  const [currentLocation, setCurrentLocation] = useState(null)
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(-1)
  const [dataLoading, setDataLoading] = useState(false)
  const [trafficData, setTrafficData] = useState([])
  const [alertsData, setAlertsData] = useState([])

  const handleSearch = async () => {
    setIsSearching(true)
    if (!search.trim()) {
      setIsSearching(false)
      return
    }
    setDataLoading(true)
    try {
      const destCoords = await geocodeAddress(search)
      const userLoc = currentLocation || await getCurrentLocation()
      const [lat, lng] = userLoc
      const osrmDest = [destCoords[1], destCoords[0]]
      const rawRoutes = await getRoutes([lng, lat], osrmDest)
      const formattedRoutes = rawRoutes.map(r => ({
        ...r,
        geometry: r.geometry.map(([lngp, latp]) => [latp, lngp])
      }))
      setRoutes(formattedRoutes)
      setDestinationCoords(destCoords)
      setSelectedRouteIndex(-1)
      setTrafficData(formattedRoutes.map((r, i) => ({
        id: i,
        segment: `Route ${i+1}`,
        level: r.traffic,
        color: r.traffic === 'low' ? 'green' : r.traffic === 'medium' ? 'yellow' : 'red',
        delay: `${Math.round(r.duration * (r.traffic === 'high' ? 1.5 : r.traffic === 'medium' ? 1.2 : 1))} min`
      })))
      const highTraffic = formattedRoutes.filter(r => r.traffic === 'high')
      setAlertsData(highTraffic.map((r, i) => ({
        id: i,
        title: `Congestion on Route ${i+1}`,
        severity: 'high',
        description: `Estimated ${Math.round(r.duration)} min due to heavy traffic`,
        coords: r.geometry[Math.floor(r.geometry.length / 2)]
      })) || [])
    } catch (err) {
      console.error('Search error:', err)
      alert('Location not found or routing service unavailable. Try "Stanford University" or enable location.')
    } finally {
      setDataLoading(false)
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

  const defaultDestination = [37.4419, -122.1430]; // Stanford University [lat, lng]

  const handleSelectRoute = (index) => {
    setSelectedRouteIndex(index);
  };

  const fetchRoutesData = async () => {
    if (!currentLocation || dataLoading) return;
    setDataLoading(true);
    try {
      const [lat, lng] = currentLocation;
      const osrmDest = [defaultDestination[1], defaultDestination[0]];
      const rawRoutes = await getRoutes([lng, lat], osrmDest);
      const formattedRoutes = rawRoutes.map(r => ({
        ...r,
        geometry: r.geometry.map(([lngp, latp]) => [latp, lngp])
      }));
      setRoutes(formattedRoutes);
      setDestinationCoords(defaultDestination);
      setTrafficData(formattedRoutes.map((r, i) => ({
        id: i,
        segment: `Route ${i+1}`,
        level: r.traffic,
        color: r.traffic === 'low' ? 'green' : r.traffic === 'medium' ? 'yellow' : 'red',
        delay: `${Math.round(r.duration * (r.traffic === 'high' ? 1.5 : r.traffic === 'medium' ? 1.2 : 1))} min`
      })));
      const highTraffic = formattedRoutes.filter(r => r.traffic === 'high');
      setAlertsData(highTraffic.map((r, i) => ({
        id: i,
        title: `Congestion on Route ${i+1}`,
        severity: 'high',
        description: `Estimated ${Math.round(r.duration)} min due to heavy traffic`,
        coords: r.geometry[Math.floor(r.geometry.length / 2)]
      })) || []);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    const initLocation = async () => {
      try {
        const loc = await getCurrentLocation();
        setCurrentLocation(loc);
      } catch (err) {
        console.log('Using default location');
        setCurrentLocation([37.7749, -122.4194]);
      }
    };
    if (!currentLocation) {
      initLocation();
    }
  }, []);

  useEffect(() => {
    if (currentLocation && routes.length === 0 && !dataLoading) {
      fetchRoutesData();
    }
  }, [activeTab, currentLocation]);

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
                {dataLoading ? (
                  <p className="text-slate-600 text-lg py-12 text-center">Loading routes...</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routes.map((route, index) => (
                      <div key={index} className={`card p-6 hover:scale-[1.02] transition-transform shadow-lg ${selectedRouteIndex === index ? 'ring-4 ring-emerald-500/30 bg-emerald-50/50' : ''}`}>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={`w-3 h-3 rounded-full ${route.traffic === 'low' ? 'bg-green-500' : route.traffic === 'medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
                          <span className="font-semibold text-slate-900">{index === 0 ? 'Recommended' : `Option ${index + 1}`}</span>
                        </div>
                        <div className="space-y-2 mb-6">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Distance</span>
                            <span className="font-bold text-2xl text-slate-900">{(route.distance / 1609).toFixed(1)} mi</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Time</span>
                            <span className="font-bold text-2xl text-emerald-600">{route.duration.toFixed(0)} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Traffic</span>
                            <span className={`px-3 py-1 capitalize ${route.traffic === 'low' ? 'bg-green-100 text-green-800' : route.traffic === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'} rounded-full text-sm font-semibold`}>
                              {route.traffic}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleSelectRoute(index)}
                          className="btn-primary w-full"
                        >
                          {selectedRouteIndex === index ? 'Selected' : 'Select Route'}
                        </button>
                      </div>
                    ))}
                    {routes.length === 0 && (
                      <p className="text-slate-600 text-lg col-span-full py-12 text-center">No routes available. Try searching a destination.</p>
                    )}
                  </div>
                )}
              </div>
            )}
{activeTab === 'traffic' && (
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
                  <ClockIcon className="h-8 w-8 text-amber-500" />
                  <span>Live Traffic</span>
                </h3>
                {dataLoading ? (
                  <p className="text-slate-600 text-lg py-12 text-center">Loading traffic data...</p>
                ) : (
                  <div className="grid gap-6">
                    {trafficData.map((traffic) => (
                      <div key={traffic.id} className="p-6 bg-gradient-to-r rounded-2xl border shadow-sm from-slate-50 to-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 text-lg">{traffic.segment}</span>
                          <div className="flex items-center space-x-4">
                            <div className={`w-5 h-5 rounded-full ${traffic.color === 'green' ? 'bg-green-500' : traffic.color === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`} />
                            <span className={`font-bold px-3 py-1 rounded-full text-sm capitalize ${traffic.color === 'green' ? 'text-green-700 bg-green-100' : traffic.color === 'yellow' ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100'}`}>
                              {traffic.level}
                            </span>
                            <span className="text-slate-600 font-medium">{traffic.delay}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {trafficData.length === 0 && <p className="text-slate-600 text-lg py-12 text-center">No current traffic issues detected.</p>}
                  </div>
                )}
              </div>
            )}
{activeTab === 'alerts' && (
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
                  <span>Alerts</span>
                </h3>
                {dataLoading ? (
                  <p className="text-slate-600 text-lg py-12 text-center">Loading alerts...</p>
                ) : (
                  <div className="space-y-4">
                    {alertsData.map((alert) => (
                      <div key={alert.id} className="p-6 border-l-4 border-orange-400 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-lg">
                        <div className="flex items-start space-x-4">
                          <ExclamationTriangleIcon className="w-7 h-7 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-bold text-xl text-slate-900">{alert.title}</h4>
                              <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded-full uppercase tracking-wide">High</span>
                            </div>
                            <p className="text-slate-700 mb-3">{alert.description}</p>
                            <div className="text-xs text-slate-500">Location-based alert</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {alertsData.length === 0 && <p className="text-slate-600 text-lg py-12 text-center flex items-center space-x-2 justify-center"><ExclamationTriangleIcon className="w-8 h-8 text-emerald-400" /><span>All clear! Safe travels.</span></p>}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

  <aside className="lg:col-span-4 mt-12 lg:mt-0">
          <MapComponent 
            routes={routes} 
            destination={destinationCoords}
            currentLocation={currentLocation}
            selectedRouteIndex={selectedRouteIndex}
          />
        </aside>
      </div>
    </div>
  )
}

