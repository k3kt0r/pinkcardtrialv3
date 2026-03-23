import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 })
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
    {
      headers: {
        "User-Agent": "AndDine Express (contact@anddine.com)",
        "Accept": "application/json",
      },
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: "Geocode failed" }, { status: 502 })
  }

  const data = await res.json()
  const addr = data.address
  const name = addr?.road || addr?.suburb || addr?.neighbourhood || addr?.city || addr?.town || addr?.village

  return NextResponse.json({ name: name || null })
}
