import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { getCurrentLocation, getRoutes } from '../services/leaflet'
import { useState, useEffect } from 'react'

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export default function MapComponent({ routes = [], destination, currentLocation, selectedRouteIndex = -1, className = 'w-full h-[500px] rounded-3xl shadow-2xl' }) {
  const [currentPosition, setCurrentPosition] = useState([37.7749, -122.4194])
  const [isLoading, setIsLoading] = useState(true)

  const position = currentLocation || currentPosition

  useEffect(() => {
    if (currentLocation) {
      setCurrentPosition(currentLocation)
      setIsLoading(false)
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude]
          setCurrentPosition(coords)
          setIsLoading(false)
        },
        () => setIsLoading(false),
        { enableHighAccuracy: true }
      )
    }
  }, [currentLocation])

  const getTrafficColor = (traffic) => {
    switch (traffic) {
      case 'low': return '#10b981'  // green
      case 'medium': return '#f59e0b' // yellow
      case 'high': return '#ef4444'  // red
      default: return '#3b82f6'
    }
  }

  const routeLines = routes.map((route, index) => (
    <Polyline
      key={`route-${index}`}
      positions={route.geometry}
      color={getTrafficColor(route.traffic)}
      weight={selectedRouteIndex === index ? 12 : 5 + index}
      opacity={selectedRouteIndex === index ? 1 : 0.8}
    />
  ))

  if (isLoading) {
    return (
      <div className={`${className} bg-slate-200 flex items-center justify-center rounded-3xl`}>
        <div className="text-lg text-slate-600">Detecting your location...</div>
      </div>
    )
  }

  return (
    <MapContainer 
      center={position} 
      zoom={12} 
      className={className}
      scrollWheelZoom={true}
    >
      {/* OSM Base */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Routes */}
      {routeLines}

      {/* Current Location Marker */}
      <Marker position={position}>
        <Popup>
          <div className="font-bold text-commute-green">Your Location</div>
        </Popup>
      </Marker>

      {/* Destination Marker */}
      {destination && (
        <Marker position={destination}>
          <Popup>
            <div className="font-bold text-primary-600">Destination</div>
            {routes.length > 0 && (
              <div>Best time: {Math.min(...routes.map(r => r.duration)).toFixed(0)} min</div>
            )}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

