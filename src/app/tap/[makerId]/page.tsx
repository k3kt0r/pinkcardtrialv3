import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Header } from "@/components/Header"
import { TapContent } from "./TapContent"

export default async function TapPage({ params }: { params: { makerId: string } }) {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/tap/${params.makerId}`)

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, organisations(name)")
    .eq("id", user.id)
    .single()

  if (!profile) redirect("/login")

  // Get maker with offers
  const { data: maker } = await supabase
    .from("makers")
    .select("*, offers(*)")
    .eq("id", params.makerId)
    .single()

  if (!maker) notFound()

  // Check if user has already redeemed today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: todayRedemption } = await supabase
    .from("redemptions")
    .select("id, redeemed_at, offers(title), makers(name)")
    .eq("user_id", user.id)
    .gte("redeemed_at", todayStart.toISOString())
    .limit(1)
    .single()

  const activeOffers = (maker.offers || []).filter((o: any) => o.active)
  const org = profile.organisations as any

  return (
    <div className="min-h-screen bg-anddine-bg">
      <Header orgName={org?.name} />
      <TapContent
        maker={{ id: maker.id, name: maker.name, address: maker.address, postcode: maker.postcode, latitude: maker.latitude, longitude: maker.longitude, image_url: maker.image_url }}
        offers={activeOffers}
        userId={user.id}
        organisationId={profile.organisation_id}
        alreadyRedeemed={!!todayRedemption}
        redemptionInfo={todayRedemption ? {
          makerName: (todayRedemption.makers as any)?.name,
          offerTitle: (todayRedemption.offers as any)?.title,
        } : null}
      />
    </div>
  )
}
