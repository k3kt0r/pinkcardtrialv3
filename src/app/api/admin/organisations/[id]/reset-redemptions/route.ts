import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const orgId = params.id

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // First check what we're about to delete
  const { data: toDelete } = await supabase
    .from("redemptions")
    .select("id, user_id, redeemed_at")
    .eq("organisation_id", orgId)
    .gte("redeemed_at", todayStart.toISOString())

  console.log("Reset redemptions for org:", orgId, "since:", todayStart.toISOString(), "found:", toDelete?.length ?? 0, toDelete)

  if (!toDelete || toDelete.length === 0) {
    return NextResponse.json({ success: true, deleted: 0, message: "No redemptions found for today" })
  }

  const ids = toDelete.map((r) => r.id)
  const { error } = await supabase
    .from("redemptions")
    .delete()
    .in("id", ids)

  if (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to reset redemptions" }, { status: 500 })
  }

  return NextResponse.json({ success: true, deleted: ids.length })
}
