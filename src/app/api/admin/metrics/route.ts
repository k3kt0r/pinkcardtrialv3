import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()

  const { data: redemptions, error } = await supabase
    .from("redemptions")
    .select("id, user_id, offer_id, maker_id, organisation_id, redeemed_at, offers(title, offer_type), makers(name), organisations(name)")

  if (error) {
    return NextResponse.json({ error: "Failed to fetch redemptions" }, { status: 500 })
  }

  const all = redemptions || []

  // Top offers
  const offerMap = new Map<string, { title: string; count: number }>()
  for (const r of all) {
    const key = r.offer_id
    const existing = offerMap.get(key)
    const title = (r.offers as any)?.title || "Unknown"
    if (existing) {
      existing.count++
    } else {
      offerMap.set(key, { title, count: 1 })
    }
  }
  const topOffers = Array.from(offerMap.entries())
    .map(([offer_id, v]) => ({ offer_id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Top makers
  const makerMap = new Map<string, { name: string; count: number }>()
  for (const r of all) {
    const key = r.maker_id
    const existing = makerMap.get(key)
    const name = (r.makers as any)?.name || "Unknown"
    if (existing) {
      existing.count++
    } else {
      makerMap.set(key, { name, count: 1 })
    }
  }
  const topMakers = Array.from(makerMap.entries())
    .map(([maker_id, v]) => ({ maker_id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Top orgs
  const orgMap = new Map<string, { name: string; count: number }>()
  for (const r of all) {
    const key = r.organisation_id
    const existing = orgMap.get(key)
    const name = (r.organisations as any)?.name || "Unknown"
    if (existing) {
      existing.count++
    } else {
      orgMap.set(key, { name, count: 1 })
    }
  }
  const topOrgs = Array.from(orgMap.entries())
    .map(([organisation_id, v]) => ({ organisation_id, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Hourly distribution (UK time)
  const hours = new Array(24).fill(0)
  for (const r of all) {
    const date = new Date(r.redeemed_at)
    const hourStr = date.toLocaleString("en-GB", { timeZone: "Europe/London", hour: "numeric", hour12: false })
    const hour = parseInt(hourStr, 10)
    if (hour >= 0 && hour < 24) hours[hour]++
  }
  const hourlyDistribution = hours.map((count, hour) => ({ hour, count }))

  return NextResponse.json({
    totalRedemptions: all.length,
    topOffers,
    topMakers,
    topOrgs,
    hourlyDistribution,
  })
}
