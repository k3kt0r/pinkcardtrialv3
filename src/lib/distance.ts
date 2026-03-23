/**
 * Calculate walking minutes from user's GPS position to a destination.
 * Uses Haversine formula for straight-line distance, then adjusts for walking.
 */

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Estimate walking minutes from straight-line distance.
 * Multiplies by 1.3 to account for street layout, then divides by walking speed.
 */
export function getWalkMinutes(
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number
): number {
  const straightLine = haversineMeters(userLat, userLng, destLat, destLng)
  const walkingDistance = straightLine * 1.3 // approximate street routing
  const walkingSpeedMpm = 80 // ~80 meters per minute (~5 km/h)
  return Math.max(1, Math.round(walkingDistance / walkingSpeedMpm))
}
