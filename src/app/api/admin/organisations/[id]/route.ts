import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const { name, allowed_domain, location } = await request.json()

  const updates: Record<string, string> = {}
  if (name) updates.name = name
  if (allowed_domain) updates.allowed_domain = allowed_domain.toLowerCase().replace(/^@/, "")
  if (location !== undefined) updates.location = location

  const { error } = await supabase
    .from("organisations")
    .update(updates)
    .eq("id", params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const orgId = params.id

  // Delete dependent rows that reference this organisation
  await supabase.from("featured_makers").delete().eq("organisation_id", orgId)
  await supabase.from("maker_offices").delete().eq("organisation_id", orgId)
  await supabase.from("user_profiles").delete().eq("organisation_id", orgId)

  const { error } = await supabase
    .from("organisations")
    .delete()
    .eq("id", orgId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
