import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { geocodeAddress } from "@/lib/geocode"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const body = await request.json()
  const { name, address, postcode, latitude, longitude } = body

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

  const { data: maker, error } = await supabase
    .from("makers")
    .update({ name, address, postcode, latitude: lat, longitude: lng })
    .eq("id", params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
