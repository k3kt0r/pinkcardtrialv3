import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"
import { AccountContent } from "./AccountContent"

export const dynamic = "force-dynamic"

const DEFAULT_SAVINGS: Record<string, number> = {
  free_item: 15,
  discount: 5,
  upgrade: 3,
  special: 10,
}

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

  // Get ALL redemptions for savings calculation (with offer details)
  const { data: allRedemptions } = await supabase
    .from("redemptions")
    .select("*, offers(title, offer_type, estimated_value), makers(name)")
    .eq("user_id", user.id)
    .order("redeemed_at", { ascending: false })

  const org = profile.organisations as any

  const redemptionsList = (allRedemptions || []).map((r: any) => {
    const offerType = r.offers?.offer_type || "free_item"
    const savings = r.offers?.estimated_value ?? DEFAULT_SAVINGS[offerType] ?? 5
    return {
      id: r.id,
      offerTitle: r.offers?.title || "Unknown offer",
      makerName: r.makers?.name || "Unknown maker",
      redeemedAt: r.redeemed_at,
      savings,
    }
  })

  return (
    <div className="min-h-screen bg-anddine-bg">
      <Header orgName={org?.name} />
      <AccountContent
        profile={{
          name: profile.name,
          email: profile.email,
          orgName: org?.name || "",
        }}
        redemptions={redemptionsList}
      />
    </div>
  )
}
