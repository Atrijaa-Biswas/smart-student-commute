import mapboxgl from 'mapbox-gl'
import polyline from '@mapbox/polyline'

// Set Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// Check token
if (!mapboxgl.accessToken || mapboxgl.accessToken === 'pk.eyJ1IjoiZGVmYXVsdCIsImEiOiJjbGI5d3h4cDAwMWU1M2pxeWQ2M3k0YzA5In0.dQw4w9WgXcQ') {
  console.warn('Mapbox token missing! Add to .env.local')
}

// const mapboxClient = new mapboxgl.Directions() // Not used; Directions lib not imported

export async function getRoutes(start, end) {
  try {
    const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?alternatives=true&geometries=geojson&access_token=${mapboxgl.accessToken}`)
    const data = await response.json()
    if (!data.routes || data.routes.length === 0) return [];
    return data.routes.map(route => ({
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry.coordinates,
      traffic: route.duration / route.duration_typical > 1.2 ? 'high' : route.duration / route.duration_typical > 1.1 ? 'medium' : 'low'
    }))
  } catch (error) {
    console.error('Mapbox routes error:', error)
    return []
  }
}

export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => resolve([position.coords.longitude, position.coords.latitude]),
      reject
    )
  })
}

export { mapboxgl }
export default mapboxgl

