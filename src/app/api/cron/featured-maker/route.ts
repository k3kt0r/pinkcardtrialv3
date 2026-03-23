import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Vercel Cron: runs daily at 6am UTC to set featured maker for each org
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: orgs } = await supabase.from("organisations").select("id")
  if (!orgs) return NextResponse.json({ error: "No orgs" }, { status: 404 })

  for (const org of orgs) {
    const { data: existing } = await supabase
      .from("featured_makers")
      .select("id")
      .eq("organisation_id", org.id)
      .eq("date", today)
      .single()

    if (existing) continue

    const { data: makerOffices } = await supabase
      .from("maker_offices")
      .select("maker_id")
      .eq("organisation_id", org.id)

    if (!makerOffices || makerOffices.length === 0) continue

    const randomIndex = Math.floor(Math.random() * makerOffices.length)
    await supabase.from("featured_makers").insert({
      organisation_id: org.id,
      maker_id: makerOffices[randomIndex].maker_id,
      date: today,
    })
  }

  return NextResponse.json({ success: true })
}
