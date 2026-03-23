import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const redirect = searchParams.get("redirect") || "/browse"

  // Handle Supabase error redirects (e.g. expired magic link)
  const authError = searchParams.get("error_description")
  if (authError) {
    console.error("[auth/callback] Supabase error:", authError)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(authError)}`
    )
  }

  if (code) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[auth/callback] Code exchange failed:", error.message)
    }

    if (!error) {
      // Check if user profile exists, create if not
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("id")
          .eq("id", user.id)
          .single()

        if (!profile) {
          // Find org by email domain
          const domain = user.email?.split("@")[1]
          const { data: org } = await supabase
            .from("organisations")
            .select("id")
            .eq("allowed_domain", domain)
            .single()

          if (org) {
            await supabase.from("user_profiles").insert({
              id: user.id,
              email: user.email!,
              organisation_id: org.id,
            })
          }
        }
      }

      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
