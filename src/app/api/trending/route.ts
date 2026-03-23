import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get("org")
  if (!orgId) {
    return NextResponse.json({ error: "org is required" }, { status: 400 })
  }

  // Today's redemptions grouped by maker
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: redemptions } = await supabase
    .from("redemptions")
    .select("maker_id")
    .eq("organisation_id", orgId)
    .gte("redeemed_at", todayStart.toISOString())

  // Count per maker
  const counts: Record<string, number> = {}
  for (const r of redemptions || []) {
    counts[r.maker_id] = (counts[r.maker_id] || 0) + 1
  }

  // If no redemptions today, fall back to yesterday
  if (Object.keys(counts).length === 0) {
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    const { data: yesterdayRedemptions } = await supabase
      .from("redemptions")
      .select("maker_id")
      .eq("organisation_id", orgId)
      .gte("redeemed_at", yesterdayStart.toISOString())
      .lt("redeemed_at", todayStart.toISOString())

    for (const r of yesterdayRedemptions || []) {
      counts[r.maker_id] = (counts[r.maker_id] || 0) + 1
    }
  }

  // Get all makers for this org with walk times
  const { data: allOffices } = await supabase
    .from("maker_offices")
    .select("maker_id, walk_minutes, makers(id, name, address, postcode, latitude, longitude, image_url, offers(id, title, description, offer_type))")
    .eq("organisation_id", orgId)
    .lte("walk_minutes", 20)
    .order("walk_minutes", { ascending: true })

  if (!allOffices || allOffices.length === 0) {
    return NextResponse.json([])
  }

  // Sort: makers with redemptions first (by count desc), then the rest by walk time
  const sorted = [...allOffices].sort((a, b) => {
    const countA = counts[a.maker_id] || 0
    const countB = counts[b.maker_id] || 0
    if (countA !== countB) return countB - countA
    return a.walk_minutes - b.walk_minutes
  })

  // Take top 5, only makers with offers
  const result = sorted
    .filter((fo: any) => fo.makers.offers && fo.makers.offers.length > 0)
    .slice(0, 5)
    .map((fo: any) => ({
      ...fo.makers,
      walk_minutes: fo.walk_minutes,
      redemption_count: counts[fo.maker_id] || 0,
    }))

  return NextResponse.json(result)
}
