"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Header } from "@/components/Header"
import { RedemptionConfirmation } from "@/components/RedemptionConfirmation"
import Link from "next/link"

interface PendingOffer {
  offer_id: string
  offer_title: string
  maker_id: string
  maker_name: string
  organisation_id: string
  selected_at: number
}

const PENDING_OFFER_KEY = "anddine_pending_offer"

function getPendingOffer(makerId: string): PendingOffer | null {
  try {
    const raw = localStorage.getItem(PENDING_OFFER_KEY)
    if (!raw) return null
    const data: PendingOffer = JSON.parse(raw)

    // Must match the maker from the NFC tag
    if (data.maker_id !== makerId) return null

    // Expire after 10 minutes
    if (Date.now() - data.selected_at > 10 * 60 * 1000) return null

    return data
  } catch {
    return null
  }
}

function clearPendingOffer() {
  localStorage.removeItem(PENDING_OFFER_KEY)
}

export default function NfcVerifyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const makerId = params.makerId as string
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"verifying" | "success" | "no_offer" | "error">("verifying")
  const [error, setError] = useState("")
  const [offerTitle, setOfferTitle] = useState("")
  const [makerName, setMakerName] = useState("")
  const [redeemedAt, setRedeemedAt] = useState("")
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    async function verify() {
      if (!token) {
        setStatus("error")
        setError("Invalid NFC tag — no token provided.")
        return
      }

      const pending = getPendingOffer(makerId)
      if (!pending) {
        setStatus("no_offer")
        return
      }

      // Step 1: Verify the NFC token
      const verifyRes = await fetch("/api/auth/verify-nfc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maker_id: makerId, nfc_token: token }),
      })

      if (!verifyRes.ok) {
        const data = await verifyRes.json()
        setStatus("error")
        setError(data.error || "NFC verification failed.")
        return
      }

      // Step 2: Redeem the offer
      const redeemRes = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer_id: pending.offer_id,
          maker_id: pending.maker_id,
          organisation_id: pending.organisation_id,
        }),
      })

      const redeemData = await redeemRes.json()

      if (!redeemRes.ok) {
        setStatus("error")
        setError(redeemData.error || "Failed to redeem offer.")
        return
      }

      // Success
      clearPendingOffer()
      setOfferTitle(pending.offer_title)
      setMakerName(pending.maker_name)
      setRedeemedAt(redeemData.redemption?.redeemed_at || new Date().toISOString())
      setStatus("success")
    }

    verify()
  }, [makerId, token])

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-anddine-bg">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-anddine-pink/10 flex items-center justify-center mb-4 animate-pulse-ring">
            <svg className="w-8 h-8 text-anddine-pink animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h1 className="text-xl font-medium">Verifying...</h1>
          <p className="text-anddine-muted text-sm">Checking your NFC tag</p>
        </main>
      </div>
    )
  }

  if (status === "no_offer") {
    return (
      <div className="min-h-screen bg-anddine-bg">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-medium mb-2">No offer selected</h1>
          <p className="text-anddine-muted mb-6">Select an offer first, then tap the NFC tag to verify.</p>
          <Link href={`/tap/${makerId}`} className="btn-primary">
            Choose an offer
          </Link>
        </main>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-anddine-bg">
        <Header />
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-medium mb-2">Something went wrong</h1>
          <p className="text-anddine-muted mb-6">{error}</p>
          <Link href={`/tap/${makerId}`} className="btn-primary">
            Try again
          </Link>
        </main>
      </div>
    )
  }

  // Success
  return (
    <div className="min-h-screen bg-anddine-bg">
      <Header />
      <RedemptionConfirmation
        offerTitle={offerTitle}
        makerName={makerName}
        redeemedAt={redeemedAt}
      />
    </div>
  )
}
