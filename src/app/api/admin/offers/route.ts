import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const body = await request.json()
  const { maker_id, title, description, offer_type, estimated_value } = body

  if (!maker_id || !title || !offer_type) {
    return NextResponse.json({ error: "Maker, title, and offer type are required" }, { status: 400 })
  }

  const { data: offer, error } = await supabase
    .from("offers")
    .insert({ maker_id, title, description: description || null, offer_type, active: true, estimated_value: estimated_value ?? null })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(offer)
}
