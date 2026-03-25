import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&countrycodes=gb`,
    {
      headers: {
        "User-Agent": "AndDine Express (contact@anddine.com)",
        "Accept": "application/json",
      },
    }
  )

  if (!res.ok) {
    return NextResponse.json([], { status: 502 })
  }

  const data = await res.json()
  return NextResponse.json(
    data.map((item: { display_name: string; lat: string; lon: string }) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }))
  )
}
