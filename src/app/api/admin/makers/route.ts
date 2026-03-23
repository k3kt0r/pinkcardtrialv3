import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { geocodeAddress } from "@/lib/geocode"

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()

  const { data: makers, error } = await supabase
    .from("makers")
    .select("*, offers(*)")
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(makers)
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const body = await request.json()
  const { name, address, postcode, latitude, longitude } = body

  if (!name || !address || !postcode) {
    return NextResponse.json({ error: "Name, address, and postcode are required" }, { status: 400 })
  }

  // Auto-geocode if coordinates not provided
  let lat = latitude || null
  let lng = longitude || null
  if (!lat || !lng) {
    const coords = await geocodeAddress(address, postcode)
    if (coords) {
      lat = coords.latitude
      lng = coords.longitude
    }
  }

  // Generate NFC token
  const nfc_token = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  const { data: maker, error } = await supabase
    .from("makers")
    .insert({ name, address, postcode, latitude: lat, longitude: lng, nfc_token })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-link to all organisations
  const { data: orgs } = await supabase
    .from("organisations")
    .select("id")

  if (orgs && orgs.length > 0) {
    await supabase
      .from("maker_offices")
      .insert(orgs.map((org) => ({
        maker_id: maker.id,
        organisation_id: org.id,
        walk_minutes: 0,
      })))
  }

  return NextResponse.json(maker)
}
