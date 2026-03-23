import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Validate domain against organisations table
  const domain = email?.split("@")[1]?.toLowerCase()
  const adminSupabase = createAdminSupabaseClient()
  const { data: org } = await adminSupabase
    .from("organisations")
    .select("id")
    .eq("allowed_domain", domain)
    .single()

  if (!org) {
    return NextResponse.json(
      { error: `Sorry, ${domain || "that domain"} isn't part of the Express Card pilot yet.` },
      { status: 403 }
    )
  }

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // No cookies needed for signup — user must verify email first
        },
      },
    }
  )

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
