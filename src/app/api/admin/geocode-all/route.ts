import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { geocodeAddress } from "@/lib/geocode"

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()

  // Re-geocode ALL makers to fix any corrupted coordinates
  const { data: makers, error } = await supabase
    .from("makers")
    .select("id, name, address, postcode")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!makers || makers.length === 0) {
    return NextResponse.json({ message: "No makers found", updated: 0 })
  }

  let updated = 0
  const failed: string[] = []

  for (const maker of makers) {
    const coords = await geocodeAddress(maker.address, maker.postcode)
    if (coords) {
      await supabase
        .from("makers")
        .update({ latitude: coords.latitude, longitude: coords.longitude })
        .eq("id", maker.id)
      updated++
    } else {
      failed.push(maker.name)
    }
    // Nominatim rate limit: 1 request per second
    await new Promise((r) => setTimeout(r, 1100))
  }

  return NextResponse.json({ updated, failed, total: makers.length })
}
