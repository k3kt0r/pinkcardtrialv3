import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { geocodeAddress } from "@/lib/geocode"
import { getMakerBrand } from "@/lib/maker-images"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const body = await request.json()
  const { name, address, postcode, latitude, longitude, tags } = body

  // Fetch existing maker to preserve coordinates when only tags/name change
  const { data: existing } = await supabase
    .from("makers")
    .select("latitude, longitude, address, postcode")
    .eq("id", params.id)
    .single()

  let lat = latitude || null
  let lng = longitude || null

  const addressChanged = existing && (existing.address !== address || existing.postcode !== postcode)
  const hasCoords = existing?.latitude != null && existing?.longitude != null

  if (!lat && !lng) {
    if (addressChanged || !hasCoords) {
      // Address/postcode changed or no coords — try geocoding
      const coords = await geocodeAddress(address, postcode)
      if (coords) {
        lat = coords.latitude
        lng = coords.longitude
      } else if (hasCoords) {
        // Geocode failed — keep existing coordinates rather than nulling them
        lat = existing.latitude
        lng = existing.longitude
      }
    } else {
      // No address change — preserve existing coordinates
      lat = existing!.latitude
      lng = existing!.longitude
    }
  }

  const { data: maker, error } = await supabase
    .from("makers")
    .update({ name, address, postcode, latitude: lat, longitude: lng, tags: tags || [] })
    .eq("id", params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sync tags to all chain locations (e.g., "atis" → "atis Covent Garden", "atis Mayfair")
  if (tags && tags.length > 0) {
    const brand = getMakerBrand(name)
    await supabase
      .from("makers")
      .update({ tags })
      .ilike("name", `${brand}%`)
      .neq("id", params.id)
  }

  return NextResponse.json(maker)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()

  const { error } = await supabase
    .from("makers")
    .delete()
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
