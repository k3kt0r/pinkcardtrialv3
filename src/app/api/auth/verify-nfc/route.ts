import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { maker_id, nfc_token } = await request.json()

  if (!maker_id || !nfc_token) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const { data: maker } = await supabase
    .from("makers")
    .select("id, nfc_token")
    .eq("id", maker_id)
    .single()

  if (!maker || maker.nfc_token !== nfc_token) {
    return NextResponse.json({ error: "Invalid NFC tag" }, { status: 403 })
  }

  return NextResponse.json({ success: true })
}
