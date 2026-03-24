"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { getMakerImage, getMakerBrand } from "@/lib/maker-images"
import { getWalkMinutes } from "@/lib/distance"
import type { OfferType } from "@/types/database"

interface TrendingMaker {
  id: string
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  image_url: string | null
  walk_minutes: number
  redemption_count: number
  offers: { id: string; title: string; description: string | null; offer_type: OfferType }[]
}

interface TrendingCarouselProps {
  orgId: string
  userLocation: { lat: number; lng: number } | null
}

function getBadge(maker: TrendingMaker, index: number, allMakers: TrendingMaker[], walkMins: number): { icon: string; label: string } {
  const maxRedemptions = Math.max(...allMakers.map((m) => m.redemption_count))

  // #1 spot with redemptions
  if (maker.redemption_count > 0 && maker.redemption_count === maxRedemptions && index === 0) {
    return { icon: "trophy", label: "#1 today" }
  }

  // High redemption count
  if (maker.redemption_count >= 10) {
    return { icon: "flame", label: "Popular" }
  }

  // Moderate redemptions
  if (maker.redemption_count >= 3) {
    return { icon: "trending", label: "Trending" }
  }

  // Some redemptions
  if (maker.redemption_count > 0) {
    return { icon: "flame", label: "Popular" }
  }

  // No redemptions — proximity & variety badges
  if (walkMins <= 5) {
    return { icon: "walk", label: "Nearby" }
  }
  if (maker.offers.length >= 3) {
    return { icon: "star", label: "Lots to try" }
  }
  if (walkMins <= 10) {
    return { icon: "walk", label: "Quick walk" }
  }
  return { icon: "badge", label: "New" }
}

const badgeIcons: Record<string, React.ReactNode> = {
  flame: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
    </svg>
  ),
  trophy: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  ),
  trending: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
    </svg>
  ),
  spark: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 2v11h3v9l7-12h-4l4-8z" />
    </svg>
  ),
  walk: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="13.5" cy="3" r="2" />
      <path d="M13.5 7c-1.1 0-2 .9-2 2v4h-2l-3.2 6.4c-.3.6.1 1.3.8 1.3.3 0 .6-.2.8-.5L10.5 15h2v5.5c0 .6.4 1 1 1s1-.4 1-1V15h1l2.6 5.2c.2.3.5.5.8.5.7 0 1.1-.7.8-1.3L16.5 13V9c0-1.1-.9-2-2-2h-1z" />
    </svg>
  ),
  star: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  badge: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" />
    </svg>
  ),
}

export function TrendingCarousel({ orgId, userLocation }: TrendingCarouselProps) {
  const [makers, setMakers] = useState<TrendingMaker[]>([])
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch(`/api/trending?org=${orgId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMakers(data)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [orgId])

  // Auto-slide every 4 seconds, resets on manual swipe
  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % makers.length)
  }, [makers.length])

  const resetAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current)
    if (makers.length <= 1) return
    autoSlideRef.current = setInterval(next, 4000)
  }, [next, makers.length])

  useEffect(() => {
    resetAutoSlide()
    return () => { if (autoSlideRef.current) clearInterval(autoSlideRef.current) }
  }, [resetAutoSlide])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (diff < -50) {
      setCurrent((c) => (c + 1) % makers.length)
      resetAutoSlide()
    } else if (diff > 50) {
      setCurrent((c) => (c - 1 + makers.length) % makers.length)
      resetAutoSlide()
    }
    touchStartX.current = null
  }

  if (!loaded || makers.length === 0) return null

  return (
    <div className="mb-5">
      <h2 className="text-sm font-semibold text-anddine-muted uppercase tracking-wide mb-2">
        {makers.some((m) => m.redemption_count > 0) ? "Trending Today" : "Top Picks"}
      </h2>

      {/* Carousel viewport */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-anddine-pink"
        style={{ minHeight: "180px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${makers.length * 100}%`,
            transform: `translateX(-${current * (100 / makers.length)}%)`,
          }}
        >
          {makers.map((maker, index) => {
            const image = getMakerImage(maker.name, maker.image_url)
            const brand = getMakerBrand(maker.name)
            const walkMins =
              userLocation && maker.latitude && maker.longitude
                ? getWalkMinutes(userLocation.lat, userLocation.lng, maker.latitude, maker.longitude)
                : maker.walk_minutes
            const badge = getBadge(maker, index, makers, walkMins)

            return (
              <Link
                key={maker.id}
                href={`/tap/${maker.id}`}
                className="block flex-shrink-0"
                style={{ width: `${100 / makers.length}%` }}
              >
                <div className="relative" style={{ minHeight: "180px" }}>
                  {image && (
                    <Image
                      src={image}
                      alt={brand}
                      fill
                      className="object-cover"
                      sizes="(max-width: 448px) 100vw, 448px"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                  <div className="relative z-10 flex flex-col justify-between h-full p-4" style={{ minHeight: "180px" }}>
                    {/* Dynamic badge */}
                    <div className="flex justify-end">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-anddine-pink px-2.5 py-1 rounded-full">
                        {badgeIcons[badge.icon]}
                        {badge.label}
                      </span>
                    </div>

                    {/* Bottom info */}
                    <div>
                      <h3 className="font-semibold text-white text-lg">{brand}</h3>
                      <p className="text-white/80 text-sm">{maker.address}</p>
                      <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="13.5" cy="3" r="2" />
                          <path d="M13.5 7c-1.1 0-2 .9-2 2v4h-2l-3.2 6.4c-.3.6.1 1.3.8 1.3.3 0 .6-.2.8-.5L10.5 15h2v5.5c0 .6.4 1 1 1s1-.4 1-1V15h1l2.6 5.2c.2.3.5.5.8.5.7 0 1.1-.7.8-1.3L16.5 13V9c0-1.1-.9-2-2-2h-1z" />
                        </svg>
                        <span>{walkMins} min walk</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {maker.offers.slice(0, 3).map((offer) => (
                          <span
                            key={offer.id}
                            className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/20 text-white backdrop-blur-sm"
                          >
                            {offer.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Dots */}
      {makers.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {makers.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === current ? "bg-anddine-pink" : "bg-anddine-pink/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
