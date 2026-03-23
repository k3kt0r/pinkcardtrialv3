/**
 * Geocode an address using OpenStreetMap Nominatim (free, no API key).
 * Returns { latitude, longitude } or null if not found.
 */
export async function geocodeAddress(
  address: string,
  postcode: string
): Promise<{ latitude: number; longitude: number } | null> {
  const query = `${address}, ${postcode}, UK`
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
  })}`

  const res = await fetch(url, {
    headers: { "User-Agent": "AndDineExpress/1.0" },
  })

  if (!res.ok) return null

  const results = await res.json()
  if (!results.length) return null

  return {
    latitude: parseFloat(results[0].lat),
    longitude: parseFloat(results[0].lon),
  }
}
