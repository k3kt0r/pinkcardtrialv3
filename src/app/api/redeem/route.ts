import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const { offer_id, maker_id, organisation_id } = body

  if (!offer_id || !maker_id || !organisation_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Check if user has already redeemed today (any maker)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: existing } = await supabase
    .from("redemptions")
    .select("id")
    .eq("user_id", user.id)
    .gte("redeemed_at", todayStart.toISOString())
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "You've already redeemed an offer today. Resets at midnight." },
      { status: 409 }
    )
  }

  // Verify the offer exists and is active
  const { data: offer } = await supabase
    .from("offers")
    .select("id, maker_id")
    .eq("id", offer_id)
    .eq("active", true)
    .single()

  if (!offer) {
    return NextResponse.json({ error: "Offer not found or inactive" }, { status: 404 })
  }

  if (offer.maker_id !== maker_id) {
    return NextResponse.json({ error: "Offer does not belong to this maker" }, { status: 400 })
  }

  // Create redemption
  const { data: redemption, error } = await supabase
    .from("redemptions")
    .insert({
      user_id: user.id,
      offer_id,
      maker_id,
      organisation_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to redeem offer" }, { status: 500 })
  }

  return NextResponse.json({ success: true, redemption })
}
