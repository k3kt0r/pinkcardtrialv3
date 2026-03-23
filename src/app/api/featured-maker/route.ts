import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// This endpoint can be called by a daily cron (e.g. Vercel Cron) to set today's featured maker
// for each organisation. Picks a random maker from the org's pool.
export async function POST() {
  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split("T")[0]

  // Get all organisations
  const { data: orgs } = await supabase.from("organisations").select("id")

  if (!orgs) {
    return NextResponse.json({ error: "No organisations found" }, { status: 404 })
  }

  const results = []

  for (const org of orgs) {
    // Check if already set for today
    const { data: existing } = await supabase
      .from("featured_makers")
      .select("id")
      .eq("organisation_id", org.id)
      .eq("date", today)
      .single()

    if (existing) {
      results.push({ org: org.id, status: "already_set" })
      continue
    }

    // Get all makers for this org
    const { data: makerOffices } = await supabase
      .from("maker_offices")
      .select("maker_id")
      .eq("organisation_id", org.id)

    if (!makerOffices || makerOffices.length === 0) continue

    // Pick a random maker
    const randomIndex = Math.floor(Math.random() * makerOffices.length)
    const selectedMaker = makerOffices[randomIndex]

    await supabase.from("featured_makers").insert({
      organisation_id: org.id,
      maker_id: selectedMaker.maker_id,
      date: today,
    })

    results.push({ org: org.id, maker: selectedMaker.maker_id, status: "set" })
  }

  return NextResponse.json({ results })
}
