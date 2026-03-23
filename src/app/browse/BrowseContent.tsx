"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { MakerCard } from "@/components/MakerCard"
import { OfferFilter } from "@/components/OfferFilter"
import { TrendingCarousel } from "@/components/TrendingCarousel"
import { getWalkMinutes } from "@/lib/distance"
import type { OfferType } from "@/types/database"

const MakerMap = dynamic(
  () => import("@/components/MakerMap").then((mod) => ({ default: mod.MakerMap })),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full rounded-2xl border border-anddine-border flex items-center justify-center bg-anddine-bg"
        style={{ height: "calc(100vh - 260px)", minHeight: "300px" }}
      >
        <p className="text-anddine-muted text-sm">Loading map...</p>
      </div>
    ),
  }
)

interface Maker {
  id: string
  name: string
  address: string
  postcode: string
  latitude: number | null
  longitude: number | null
  image_url: string | null
  walk_minutes: number
  offers: { id: string; title: string; description: string | null; offer_type: OfferType }[]
}

interface BrowseContentProps {
  makers: Maker[]
  featuredMakerId: string | null
  userName: string | null
  orgName: string
  orgId: string
  hotMakers: Record<string, number>
}

export function BrowseContent({ makers, featuredMakerId, userName, orgName, orgId, hotMakers }: BrowseContentProps) {
  const [filter, setFilter] = useState<OfferType | "all">("all")
  const [view, setView] = useState<"list" | "map">("list")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<"loading" | "granted" | "denied">("loading")
  const [locationName, setLocationName] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserLocation({ lat, lng })
        setLocationStatus("granted")

        fetch(`/api/geocode?lat=${lat}&lng=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.name) setLocationName(data.name)
          })
          .catch(() => {})
      },
      () => {
        setLocationStatus("denied")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const makersWithDistance = useMemo(() => {
    return makers.map((maker) => {
      if (userLocation && maker.latitude && maker.longitude) {
        const walkMins = getWalkMinutes(
          userLocation.lat,
          userLocation.lng,
          maker.latitude,
          maker.longitude
        )
        return { ...maker, walk_minutes: walkMins }
      }
      return maker
    })
  }, [makers, userLocation])

  const sorted = useMemo(() => {
    return [...makersWithDistance].sort((a, b) => a.walk_minutes - b.walk_minutes)
  }, [makersWithDistance])

  const filtered = sorted.filter((maker) => {
    if (filter === "all") return true
    return maker.offers.some((o) => o.offer_type === filter)
  })

  const featuredMaker = featuredMakerId
    ? filtered.find((m) => m.id === featuredMakerId)
    : null

  const otherMakers = filtered.filter((m) => m.id !== featuredMakerId)

  return (
    <main className="px-4 py-5">
      {userName && (
        <p className="text-anddine-muted text-sm mb-1">
          Hey {userName},
        </p>
      )}
      <h1 className="text-2xl font-medium mb-1">
        {locationName ? `You're at ${locationName}` : "Makers Near You"}
      </h1>
      <p className="text-anddine-muted text-sm mb-4">
        {makers.length} Makers with offers near you
      </p>

      <TrendingCarousel orgId={orgId} userLocation={userLocation} />

      <OfferFilter active={filter} onChange={setFilter} />

      {/* View toggle */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <p className="text-anddine-muted text-sm">
          {filtered.length} {filtered.length === 1 ? "Maker" : "Makers"}
        </p>
        <div className="flex bg-white rounded-full border border-anddine-border p-0.5">
          <button
            onClick={() => setView("list")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              view === "list" ? "bg-anddine-pink text-white" : "text-anddine-muted"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView("map")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              view === "map" ? "bg-anddine-pink text-white" : "text-anddine-muted"
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-3">
          {featuredMaker && (
            <MakerCard
              key={featuredMaker.id}
              id={featuredMaker.id}
              name={featuredMaker.name}
              address={featuredMaker.address}
              walkMinutes={featuredMaker.walk_minutes}
              offers={featuredMaker.offers}
              imageUrl={featuredMaker.image_url}
              featured
              hotCount={hotMakers[featuredMaker.id] || 0}
            />
          )}

          {otherMakers.map((maker) => (
            <MakerCard
              key={maker.id}
              id={maker.id}
              name={maker.name}
              address={maker.address}
              walkMinutes={maker.walk_minutes}
              offers={maker.offers}
              imageUrl={maker.image_url}
              hotCount={hotMakers[maker.id] || 0}
            />
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-anddine-muted">No Makers match this filter.</p>
            </div>
          )}
        </div>
      ) : (
        <MakerMap
          makers={filtered}
          userLocation={userLocation}
          featuredMakerId={featuredMakerId}
        />
      )}
    </main>
  )
}
