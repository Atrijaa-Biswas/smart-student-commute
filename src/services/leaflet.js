import L from 'leaflet'

// Custom tiles for traffic-like visualization (free OSM)
export const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
export const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Traffic overlay tiles (free)
export const trafficUrl = 'https://traffic.api.here.com/tiles/traffic/1.0/flow/{z}/{x}/{y}/png?app_id=YOUR_ID&app_code=YOUR_CODE' // Replace or use free alternatives
export const trafficAttribution = 'HERE Traffic'

export function createMap(container, center = [37.7749, -122.4194], zoom = 12) {
  const map = L.map(container).setView(center, zoom)
  
  L.tileLayer(osmUrl, {
    attribution: osmAttribution,
    maxZoom: 19,
  }).addTo(map)

  // Add geolocation
  L.control.locate({
    locateOptions: {
      watch: true,
      enableHighAccuracy: true
    }
  }).addTo(map)

  return map
}

export function addRoute(map, coordinates, color = 'blue') {
  L.polyline(coordinates, {
    color,
    weight: 5,
    opacity: 0.8
  }).addTo(map)
}

export function getRoutes(start, end) {
  // Free OSRM routing (openstreetmap.org)
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?alternatives=true&geometries=geojson&overview=full`
  
  return fetch(osrmUrl)
    .then(res => res.json())
    .then(data => data.routes.map(route => ({
      distance: route.distance / 1000,
      duration: route.duration / 60,
      geometry: route.geometry.coordinates,
      traffic: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' // Simulate
    })))
    .catch(() => [])
}

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve([pos.coords.latitude, pos.coords.longitude]),
      reject
    )
  })
}

export default L

