// Free Nominatim geocode (OSM)
export async function geocodeAddress(address) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`)
  const data = await response.json()
  if (data[0]) {
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)]
  }
  throw new Error('Address not found')
}

// Reverse geocode for alerts
export async function reverseGeocode(coords) {
  const [lon, lat] = coords
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
  const data = await response.json()
  return data.display_name || 'Unknown location'
}

