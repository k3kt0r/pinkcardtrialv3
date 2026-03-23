import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { Header } from "@/components/Header"
import { RedemptionConfirmation } from "@/components/RedemptionConfirmation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function NfcVerifyPage({
  params,
  searchParams,
}: {
  params: { makerId: string }
  searchParams: { token?: string }
}) {
  const makerId = params.makerId
  const token = searchParams.token

  if (!token) {
    return (
      <NfcResult
        type="error"
        makerId={makerId}
        title="Invalid NFC tag"
        message="No token provided."
      />
    )
  }

  const admin = createAdminSupabaseClient()

  // Step 1: Verify NFC token matches this maker
  const { data: maker } = await admin
    .from("makers")
    .select("id, name, nfc_token")
    .eq("id", makerId)
    .single()

  if (!maker || maker.nfc_token !== token) {
    return (
      <NfcResult
        type="error"
        makerId={makerId}
        title="Invalid NFC tag"
        message="This tag could not be verified."
      />
    )
  }

  // Step 2: Find pending offer for this maker (within 10 minutes, not yet redeemed)
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data: pending } = await admin
    .from("pending_offers")
    .select("*")
    .eq("maker_id", makerId)
    .eq("redeemed", false)
    .gte("created_at", tenMinsAgo)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!pending) {
    return (
      <NfcResult
        type="no_offer"
        makerId={makerId}
        title="No offer selected"
        message="Select an offer in the app first, then tap the NFC tag."
      />
    )
  }

  // Step 3: Check if user already redeemed today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: existing } = await admin
    .from("redemptions")
    .select("id")
    .eq("user_id", pending.user_id)
    .gte("redeemed_at", todayStart.toISOString())
    .limit(1)

  if (existing && existing.length > 0) {
    return (
      <NfcResult
        type="error"
        makerId={makerId}
        title="Already redeemed"
        message="You've already redeemed an offer today. Come back tomorrow!"
      />
    )
  }

  // Step 4: Verify the offer exists and is active
  const { data: offer } = await admin
    .from("offers")
    .select("id, maker_id")
    .eq("id", pending.offer_id)
    .eq("active", true)
    .single()

  if (!offer || offer.maker_id !== makerId) {
    return (
      <NfcResult
        type="error"
        makerId={makerId}
        title="Offer unavailable"
        message="This offer is no longer available."
      />
    )
  }

  // Step 5: Create redemption using admin client (no user auth needed)
  const { data: redemption, error: redeemError } = await admin
    .from("redemptions")
    .insert({
      user_id: pending.user_id,
      offer_id: pending.offer_id,
      maker_id: pending.maker_id,
      organisation_id: pending.organisation_id,
    })
    .select()
    .single()

  if (redeemError) {
    return (
      <NfcResult
        type="error"
        makerId={makerId}
        title="Redemption failed"
        message="Something went wrong. Please try again."
      />
    )
  }

  // Step 6: Mark pending offer as redeemed
  await admin
    .from("pending_offers")
    .update({ redeemed: true, redeemed_at: redemption.redeemed_at })
    .eq("id", pending.id)

  // Success — full confirmation page
  return (
    <div className="min-h-screen bg-anddine-bg">
      <Header />
      <RedemptionConfirmation
        offerTitle={pending.offer_title}
        makerName={pending.maker_name}
        redeemedAt={redemption.redeemed_at || new Date().toISOString()}
      />
    </div>
  )
}

function NfcResult({
  type,
  makerId,
  title,
  message,
}: {
  type: "success" | "error" | "no_offer"
  makerId: string
  title: string
  message: string
}) {
  const icon = {
    success: (
      <div className="w-16 h-16 rounded-full bg-anddine-pink/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-anddine-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    error: (
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
    no_offer: (
      <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
    ),
  }

  return (
    <div className="min-h-screen bg-anddine-bg">
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="animate-fade-in">
          <div className="mb-4 flex justify-center">{icon[type]}</div>
          <h1 className="text-2xl font-medium mb-2">{title}</h1>
          <p className="text-anddine-muted mb-6">{message}</p>
          {type === "success" && (
            <p className="text-anddine-pink text-sm font-semibold">Return to the &Dine app to see your offer</p>
          )}
          {type === "no_offer" && (
            <Link href={`/tap/${makerId}`} className="btn-primary">
              Choose an offer
            </Link>
          )}
          {type === "error" && (
            <Link href={`/tap/${makerId}`} className="btn-primary">
              Try again
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
