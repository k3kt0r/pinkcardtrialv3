import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()

  const { data: makers } = await supabase.from("makers").select("id")
  const { data: orgs } = await supabase.from("organisations").select("id")
  const { data: existing } = await supabase.from("maker_offices").select("maker_id, organisation_id")

  if (!makers || !orgs) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }

  const existingSet = new Set(
    (existing || []).map((e) => `${e.maker_id}:${e.organisation_id}`)
  )

  const missing = []
  for (const maker of makers) {
    for (const org of orgs) {
      if (!existingSet.has(`${maker.id}:${org.id}`)) {
        missing.push({ maker_id: maker.id, organisation_id: org.id, walk_minutes: 0 })
      }
    }
  }

  if (missing.length > 0) {
    await supabase.from("maker_offices").insert(missing)
  }

  return NextResponse.json({ linked: missing.length })
}
