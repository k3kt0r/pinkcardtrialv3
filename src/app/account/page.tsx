import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"
import { AccountContent } from "./AccountContent"

export default async function AccountPage() {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, organisations(name)")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  // Get recent redemptions
  const { data: redemptions } = await supabase
    .from("redemptions")
    .select("*, offers(title), makers(name)")
    .eq("user_id", user.id)
    .order("redeemed_at", { ascending: false })
    .limit(20)

  const org = profile.organisations as any

  return (
    <div className="min-h-screen bg-anddine-bg">
      <Header orgName={org?.name} />
      <AccountContent
        profile={{
          name: profile.name,
          email: profile.email,
          orgName: org?.name || "",
        }}
        redemptions={(redemptions || []).map((r: any) => ({
          id: r.id,
          offerTitle: r.offers?.title || "Unknown offer",
          makerName: r.makers?.name || "Unknown maker",
          redeemedAt: r.redeemed_at,
        }))}
      />
    </div>
  )
}
