import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()

  const nfc_token = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  const { data, error } = await supabase
    .from("makers")
    .update({ nfc_token })
    .eq("id", params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
