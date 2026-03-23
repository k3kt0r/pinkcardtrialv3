import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { offer_id, offer_title, maker_id, maker_name, organisation_id } = await request.json()

  if (!offer_id || !maker_id || !organisation_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const admin = createAdminSupabaseClient()

  // Delete any existing pending (unredeemed) offers for this user
  await admin
    .from("pending_offers")
    .delete()
    .eq("user_id", user.id)
    .eq("redeemed", false)

  // Create new pending offer
  const { data, error } = await admin
    .from("pending_offers")
    .insert({
      user_id: user.id,
      offer_id,
      offer_title,
      maker_id,
      maker_name,
      organisation_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: "Failed to save pending offer" }, { status: 500 })
  }

  return NextResponse.json({ success: true, pending_offer: data })
}

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const admin = createAdminSupabaseClient()

  // Get the user's most recent pending offer (within 10 minutes)
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data } = await admin
    .from("pending_offers")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", tenMinsAgo)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!data) {
    return NextResponse.json({ status: "none" })
  }

  if (data.redeemed) {
    return NextResponse.json({
      status: "redeemed",
      pending_offer: data,
    })
  }

  return NextResponse.json({ status: "pending", pending_offer: data })
}
