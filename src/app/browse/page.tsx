import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"
import { BrowseContent } from "./BrowseContent"

export const dynamic = "force-dynamic"

export default async function BrowsePage() {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get user profile with org
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, organisations(*)")
    .eq("id", user.id)
    .single()

  if (!profile || !profile.organisation_id) {
    redirect("/login?error=no_org")
  }

  const orgId = profile.organisation_id

  // Get makers for this org with offers
  const { data: makerOffices } = await supabase
    .from("maker_offices")
    .select(`
      walk_minutes,
      makers (
        id,
        name,
        address,
        postcode,
        latitude,
        longitude,
        image_url,
        offers (
          id,
          title,
          description,
          offer_type
        )
      )
    `)
    .eq("organisation_id", orgId)
    .order("walk_minutes", { ascending: true })

  // Get today's redemption counts per maker
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { data: todayRedemptions } = await supabase
    .from("redemptions")
    .select("maker_id")
    .eq("organisation_id", orgId)
    .gte("redeemed_at", todayStart.toISOString())

  const redeemCounts: Record<string, number> = {}
  for (const r of todayRedemptions || []) {
    redeemCounts[r.maker_id] = (redeemCounts[r.maker_id] || 0) + 1
  }
  // Top 3 maker IDs with at least 1 redemption
  const hotMakerIds = Object.entries(redeemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id)

  // Get today's featured maker
  const today = new Date().toISOString().split("T")[0]
  const { data: featured } = await supabase
    .from("featured_makers")
    .select("maker_id")
    .eq("organisation_id", orgId)
    .eq("date", today)
    .single()

  const makers = (makerOffices || [])
    .filter((mo: any) => mo.makers.offers && mo.makers.offers.length > 0)
    .map((mo: any) => ({
      id: mo.makers.id,
      name: mo.makers.name,
      address: mo.makers.address,
      postcode: mo.makers.postcode,
      latitude: mo.makers.latitude,
      longitude: mo.makers.longitude,
      image_url: mo.makers.image_url || null,
      walk_minutes: mo.walk_minutes,
      offers: mo.makers.offers,
    }))

  const org = profile.organisations as any

  return (
    <div className="min-h-screen bg-anddine-bg">
      <Header orgName={org?.name} />
      <BrowseContent
        makers={makers}
        featuredMakerId={featured?.maker_id || null}
        userName={profile.name}
        orgName={org?.name}
        orgId={orgId}
        hotMakers={hotMakerIds.reduce((acc, id) => ({ ...acc, [id]: redeemCounts[id] }), {} as Record<string, number>)}
      />
    </div>
  )
}
