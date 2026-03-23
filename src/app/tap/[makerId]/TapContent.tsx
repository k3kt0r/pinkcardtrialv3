"use client"

import { useState, useEffect } from "react"
import { offerTypeBadge } from "@/lib/offer-utils"
import { getWalkMinutes } from "@/lib/distance"
import type { OfferType } from "@/types/database"
import Link from "next/link"
import Image from "next/image"
import { getMakerBrand } from "@/lib/maker-images"

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
  localStorage.setItem(PENDING_OFFER_KEY, JSON.stringify({
    ...data,
    selected_at: Date.now(),
  }))
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
        <p className="text-anddine-muted text-sm mt-2">Resets at midnight.</p>
        <Link href="/browse" className="btn-secondary mt-8">
          Back to Makers
        </Link>
      </main>
    )
  }

  // Phase 2: Offer selected — show "Tap NFC" screen
  if (selectedOffer) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-anddine-pink/10 flex items-center justify-center mx-auto mb-6 animate-phone-bounce">
            <svg className="w-10 h-10 text-anddine-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
            </svg>
          </div>

          <h1 className="text-2xl font-medium mb-2">Tap the NFC tag</h1>
          <p className="text-anddine-muted mb-6">
            Hold your phone to the NFC tag at <span className="font-semibold text-anddine-text">{brand}</span>
          </p>

          <div className="card inline-block text-center mb-6">
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
