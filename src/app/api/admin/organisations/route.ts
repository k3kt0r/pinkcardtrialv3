import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

const DEFAULT_SAVINGS: Record<string, number> = {
  free_item: 15,
  discount: 5,
  upgrade: 3,
  special: 10,
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()

  const { data: orgs, error } = await supabase
    .from("organisations")
    .select("*")
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch all redemptions with offer values to calculate savings per org
  const { data: redemptions } = await supabase
    .from("redemptions")
    .select("organisation_id, offers(offer_type, estimated_value)")

  const orgSavings: Record<string, number> = {}
  for (const r of redemptions || []) {
    const offer = r.offers as any
    const value = offer?.estimated_value != null ? Number(offer.estimated_value) : (DEFAULT_SAVINGS[offer?.offer_type] ?? 5)
    orgSavings[r.organisation_id] = (orgSavings[r.organisation_id] || 0) + value
  }

  const orgsWithSavings = (orgs || []).map((org: any) => ({
    ...org,
    total_savings: Math.round((orgSavings[org.id] || 0) * 100) / 100,
  }))

  return NextResponse.json(orgsWithSavings)
}

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const { name, allowed_domain, location } = await request.json()

  if (!name || !allowed_domain) {
    return NextResponse.json({ error: "Name and domain are required" }, { status: 400 })
  }

  const domain = allowed_domain.toLowerCase().replace(/^@/, "")
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

  const { data: org, error } = await supabase
    .from("organisations")
    .insert({ name, slug, allowed_domain: domain, location: location || "" })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-link to all existing makers
  const { data: makers } = await supabase.from("makers").select("id")
  if (makers && makers.length > 0) {
    await supabase
      .from("maker_offices")
      .insert(makers.map((m) => ({
        maker_id: m.id,
        organisation_id: org.id,
        walk_minutes: 0,
      })))
  }

  return NextResponse.json(org)
}
