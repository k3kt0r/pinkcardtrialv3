"use client"

import { useState, useEffect } from "react"
import { offerTypeBadge } from "@/lib/offer-utils"
import { getWalkMinutes } from "@/lib/distance"
import type { OfferType } from "@/types/database"
import Link from "next/link"
import Image from "next/image"
import { getMakerBrand } from "@/lib/maker-images"

function useCountdown() {
  const [remaining, setRemaining] = useState("")
  useEffect(() => {
    function update() {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setRemaining(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])
  return remaining
}

interface TapContentProps {
  maker: { id: string; name: string; address: string; postcode: string; latitude: number | null; longitude: number | null }
  offers: { id: string; title: string; description: string | null; offer_type: OfferType }[]
  userId: string
  organisationId: string
  alreadyRedeemed: boolean
  redemptionInfo: { makerName: string; offerTitle: string } | null
}

interface SelectedOffer {
  id: string
  title: string
}

const PENDING_OFFER_KEY = "anddine_pending_offer"

function savePendingOffer(data: {
  offer_id: string
  offer_title: string
  maker_id: string
  maker_name: string
  organisation_id: string
}) {
  const payload = JSON.stringify({ ...data, selected_at: Date.now() })
  localStorage.setItem(PENDING_OFFER_KEY, payload)
  // Also save as cookie so it's accessible when NFC opens in a new context
  document.cookie = `${PENDING_OFFER_KEY}=${encodeURIComponent(payload)}; path=/; max-age=600; SameSite=Lax`
}

export function TapContent({
  maker,
  offers,
  userId,
  organisationId,
  alreadyRedeemed,
  redemptionInfo,
}: TapContentProps) {
  const [selectedOffer, setSelectedOffer] = useState<SelectedOffer | null>(null)
  const [walkMins, setWalkMins] = useState<number | null>(null)
  const countdown = useCountdown()

  const brand = getMakerBrand(maker.name)

  useEffect(() => {
    if (!navigator.geolocation || !maker.latitude || !maker.longitude) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const mins = getWalkMinutes(pos.coords.latitude, pos.coords.longitude, maker.latitude!, maker.longitude!)
        setWalkMins(mins)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [maker.latitude, maker.longitude])

  if (alreadyRedeemed) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-anddine-pink/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-anddine-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-medium mb-2">Already redeemed today</h1>
        <p className="text-anddine-muted mb-1">
          You used <span className="font-medium text-anddine-text">{redemptionInfo?.offerTitle}</span>
        </p>
        <p className="text-anddine-muted mb-1">
          at <span className="font-medium text-anddine-text">{redemptionInfo?.makerName}</span>
        </p>
        <p className="text-anddine-muted text-sm mt-2">Next offer available in <span className="font-bold font-mono">{countdown}</span></p>
        <Link href="/browse" className="btn-secondary mt-8">
          Back to Makers
        </Link>
      </main>
    )
  }

  // Phase 2: Offer selected — show NFC instructions
  const [nfcPhase, setNfcPhase] = useState<"tap" | "open">("tap")
  const [touchStart, setTouchStart] = useState<number | null>(null)

  useEffect(() => {
    if (!selectedOffer) {
      setNfcPhase("tap")
      return
    }
    const timer = setTimeout(() => setNfcPhase("open"), 4000)
    return () => clearTimeout(timer)
  }, [selectedOffer])

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX)
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return
    const diff = e.changedTouches[0].clientX - touchStart
    if (diff > 60) setNfcPhase("tap")
    if (diff < -60) setNfcPhase("open")
    setTouchStart(null)
  }

  if (selectedOffer) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="animate-fade-in">

          {/* Infographic area — swipeable */}
          <div
            className="relative h-48 mb-6 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Phase 1: Phone with contactless signal */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-end pb-2 transition-all duration-700 ease-in-out"
              style={{
                transform: nfcPhase === "tap" ? "translateX(0)" : "translateX(-120%)",
                opacity: nfcPhase === "tap" ? 1 : 0,
              }}
            >
              <div className="w-28 h-28 rounded-full bg-anddine-pink/10 flex items-center justify-center animate-phone-bounce">
                <svg className="w-14 h-14 text-anddine-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
                </svg>
              </div>
            </div>

            {/* Phase 2: iPhone with notification — slides in from right */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out"
              style={{
                transform: nfcPhase === "open" ? "translateX(0)" : "translateX(120%)",
                opacity: nfcPhase === "open" ? 1 : 0,
              }}
            >
              {/* iPhone mockup */}
              <div className="relative w-32 h-44 rounded-2xl border-2 border-anddine-muted/30 bg-white shadow-lg overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-anddine-muted/20 rounded-b-lg" />
                {/* Screen content */}
                <div className="pt-5 px-2">
                  {/* Notification banner sliding down */}
                  <div
                    className="bg-anddine-bg border border-anddine-border rounded-lg px-2 py-1.5 shadow-sm"
                    style={{
                      animation: nfcPhase === "open" ? "slideDown 0.5s 0.7s both" : "none",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-anddine-pink/20 flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5 text-anddine-pink" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-anddine-text truncate" style={{ fontSize: "6px", lineHeight: "8px" }}>&Dine Express</p>
                        <p className="text-anddine-muted truncate" style={{ fontSize: "5px", lineHeight: "7px" }}>Tap to verify your offer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Swipe dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            <button onClick={() => setNfcPhase("tap")} className={`w-1.5 h-1.5 rounded-full transition-colors ${nfcPhase === "tap" ? "bg-anddine-pink" : "bg-anddine-pink/30"}`} />
            <button onClick={() => setNfcPhase("open")} className={`w-1.5 h-1.5 rounded-full transition-colors ${nfcPhase === "open" ? "bg-anddine-pink" : "bg-anddine-pink/30"}`} />
          </div>

          {/* Text */}
          <div className="transition-all duration-500">
            <h1 className="text-2xl font-medium mb-2">
              {nfcPhase === "tap" ? "Hold your phone to the tag" : "Tap the notification"}
            </h1>
            <p className="text-anddine-muted">
              {nfcPhase === "tap"
                ? <>Place the top of your phone against the NFC tag at <span className="font-semibold text-anddine-text">{brand}</span></>
                : "Tap the link at the top of your screen"
              }
            </p>
          </div>

          {/* Selected offer card */}
          <div className="card inline-block text-center mt-8 mb-6">
            <p className="text-anddine-pink text-xs font-semibold mb-1">Selected offer</p>
            <h3 className="font-semibold text-anddine-text">{selectedOffer.title}</h3>
          </div>
        </div>

        <button
          onClick={() => setSelectedOffer(null)}
          className="text-anddine-pink hover:underline text-sm"
        >
          Choose a different offer
        </button>
      </main>
    )
  }

  // Phase 1: Offer selection
  return (
    <main className="px-4 py-5">
      <div className="bg-anddine-pink/5 border border-anddine-pink/20 rounded-2xl p-4 mb-6">
        <p className="text-xs text-anddine-pink font-semibold mb-1">You&apos;re at</p>
        <h1 className="text-xl font-medium">{brand}</h1>
        <p className="text-anddine-muted text-sm">{maker.address}, {maker.postcode}</p>
        {walkMins !== null && (
          <div className="flex items-center gap-1 text-anddine-muted text-sm mt-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="13.5" cy="3" r="2" />
              <path d="M13.5 7c-1.1 0-2 .9-2 2v4h-2l-3.2 6.4c-.3.6.1 1.3.8 1.3.3 0 .6-.2.8-.5L10.5 15h2v5.5c0 .6.4 1 1 1s1-.4 1-1V15h1l2.6 5.2c.2.3.5.5.8.5.7 0 1.1-.7.8-1.3L16.5 13V9c0-1.1-.9-2-2-2h-1z" />
            </svg>
            <span>{walkMins} min walk</span>
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-3">Choose an offer to redeem</h2>
      <p className="text-anddine-muted text-sm mb-4">Select one, then tap the NFC tag at the counter to verify.</p>

      <div className="space-y-3">
        {offers.map((offer) => {
          const badge = offerTypeBadge(offer.offer_type)
          return (
            <button
              key={offer.id}
              onClick={() => {
                savePendingOffer({
                  offer_id: offer.id,
                  offer_title: offer.title,
                  maker_id: maker.id,
                  maker_name: brand,
                  organisation_id: organisationId,
                })
                setSelectedOffer({ id: offer.id, title: offer.title })
              }}
              className="w-full text-left card hover:border-anddine-pink transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-anddine-text">{offer.title}</h3>
                  {offer.description && (
                    <p className="text-anddine-muted text-sm mt-0.5">{offer.description}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2 ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <div className="mt-3 text-anddine-pink text-sm font-semibold">
                Select this offer &rarr;
              </div>
            </button>
          )
        })}
      </div>
    </main>
  )
}
