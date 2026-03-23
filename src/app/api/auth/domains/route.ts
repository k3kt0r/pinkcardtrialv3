import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = createAdminSupabaseClient()

  const { data: orgs, error } = await supabase
    .from("organisations")
    .select("allowed_domain")
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const domains = (orgs || []).map((o) => o.allowed_domain)
  return NextResponse.json({ domains }, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  })
}
