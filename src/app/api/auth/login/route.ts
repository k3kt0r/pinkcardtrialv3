import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const cookieStore = cookies()
  const pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          pendingCookies.push(...cookiesToSet)
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // Create profile if needed
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!profile) {
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

  // Build response and set cookies with localhost-safe options
  const response = NextResponse.json({ success: true })
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...(options as any),
      secure: false,
      sameSite: "lax" as const,
      path: "/",
    })
  })

  return response
}
