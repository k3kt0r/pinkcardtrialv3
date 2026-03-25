import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

const DEFAULT_SAVINGS: Record<string, number> = {
  free_item: 15,
  discount: 5,
  upgrade: 3,
  special: 10,
}

function getSavings(offer: any): number {
  if (offer?.estimated_value != null) return Number(offer.estimated_value)
  return DEFAULT_SAVINGS[offer?.offer_type] ?? 5
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") || "all"

  const { data: redemptions, error } = await supabase
    .from("redemptions")
    .select("id, user_id, offer_id, maker_id, organisation_id, redeemed_at, offers(title, offer_type, estimated_value), makers(name), organisations(name)")

  if (error) {
    return NextResponse.json({ error: "Failed to fetch redemptions" }, { status: 500 })
  }

  let all = redemptions || []

  if (range !== "all") {
    const now = new Date()
    let cutoff: Date
    if (range === "day") {
      cutoff = new Date(now)
      cutoff.setHours(0, 0, 0, 0)
    } else if (range === "week") {
      cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - 7)
      cutoff.setHours(0, 0, 0, 0)
    } else if (range === "month") {
      cutoff = new Date(now)
      cutoff.setMonth(cutoff.getMonth() - 1)
      cutoff.setHours(0, 0, 0, 0)
    } else if (range === "year") {
      cutoff = new Date(now)
      cutoff.setFullYear(cutoff.getFullYear() - 1)
      cutoff.setHours(0, 0, 0, 0)
    } else {
      cutoff = new Date(0)
    }
    all = all.filter((r) => new Date(r.redeemed_at) >= cutoff)
  }

  // Total savings
  let totalSavings = 0
  for (const r of all) {
    totalSavings += getSavings(r.offers)
  }

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

  // Top orgs with savings
  const orgMap = new Map<string, { name: string; count: number; savings: number }>()
  for (const r of all) {
    const key = r.organisation_id
    const existing = orgMap.get(key)
    const name = (r.organisations as any)?.name || "Unknown"
    const s = getSavings(r.offers)
    if (existing) {
      existing.count++
      existing.savings += s
    } else {
      orgMap.set(key, { name, count: 1, savings: s })
    }
  }
  const topOrgs = Array.from(orgMap.entries())
    .map(([organisation_id, v]) => ({ organisation_id, ...v }))
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 10)

  // Popular makers by organisation
  const orgMakerMap = new Map<string, {
    name: string
    makers: Map<string, { name: string; count: number }>
    total: number
  }>()

  for (const r of all) {
    const orgKey = r.organisation_id
    const orgName = (r.organisations as any)?.name || "Unknown"
    const makerKey = r.maker_id
    const makerName = (r.makers as any)?.name || "Unknown"

    let org = orgMakerMap.get(orgKey)
    if (!org) {
      org = { name: orgName, makers: new Map(), total: 0 }
      orgMakerMap.set(orgKey, org)
    }
    org.total++

    const existing = org.makers.get(makerKey)
    if (existing) {
      existing.count++
    } else {
      org.makers.set(makerKey, { name: makerName, count: 1 })
    }
  }

  const makersByOrg = Array.from(orgMakerMap.entries())
    .map(([organisation_id, org]) => ({
      organisation_id,
      organisation_name: org.name,
      total_redemptions: org.total,
      topMakers: Array.from(org.makers.entries())
        .map(([maker_id, v]) => ({ maker_id, ...v }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    }))
    .sort((a, b) => b.total_redemptions - a.total_redemptions)

  return NextResponse.json({
    totalRedemptions: all.length,
    totalSavings: Math.round(totalSavings * 100) / 100,
    topOffers,
    topMakers,
    topOrgs,
    makersByOrg,
  })
}
