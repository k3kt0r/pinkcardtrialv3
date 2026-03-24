"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { MakerCard } from "@/components/MakerCard"
import { OfferFilter } from "@/components/OfferFilter"
import { TrendingCarousel } from "@/components/TrendingCarousel"
import { Header } from "@/components/Header"
import { getWalkMinutes } from "@/lib/distance"
import { TagIcon } from "@/components/TagIcon"
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
  tags: string[]
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
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
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

  // Tags that actually have makers (respecting current offer filter), ordered by popularity
  const TAG_ORDER = [
    "healthy", "lunch", "coffee", "breakfast", "dinner",
    "vegan", "vegetarian", "gluten-free",
    "burgers", "pizza", "sushi", "sandwiches", "wraps", "salads",
    "thai", "indian", "italian", "japanese", "chinese", "vietnamese", "mexican", "mediterranean",
    "bakery", "desserts", "street food", "drinks", "meal deal",
  ]

  const availableTags = useMemo(() => {
    const offerFiltered = filter === "all"
      ? sorted
      : sorted.filter((m) => m.offers.some((o) => o.offer_type === filter))
    const tagSet = new Set<string>()
    offerFiltered.forEach((m) => (m.tags || []).forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort((a, b) => {
      const ai = TAG_ORDER.indexOf(a)
      const bi = TAG_ORDER.indexOf(b)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  }, [sorted, filter])

  // Clear selected tag if it's no longer available
  useEffect(() => {
    if (selectedTag && !availableTags.includes(selectedTag)) {
      setSelectedTag(null)
    }
  }, [availableTags, selectedTag])

  const filtered = sorted.filter((maker) => {
    if (searchQuery && !maker.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filter !== "all" && !maker.offers.some((o) => o.offer_type === filter)) return false
    if (selectedTag && !(maker.tags || []).includes(selectedTag)) return false
    return true
  })

  const featuredMaker = featuredMakerId
    ? filtered.find((m) => m.id === featuredMakerId)
    : null

  const otherMakers = filtered.filter((m) => m.id !== featuredMakerId)

  return (
    <>
    <Header orgName={orgName} onSearch={setSearchQuery} />
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

      {/* Food category filter */}
      {availableTags.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4 mb-3 scrollbar-hide">
          <div className="flex gap-3 w-max py-1">
            <button
              onClick={() => setSelectedTag(null)}
              className="flex flex-col items-center gap-1 w-14"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                selectedTag === null
                  ? "bg-anddine-pink/10 ring-2 ring-anddine-pink scale-105 text-anddine-pink"
                  : "bg-gray-100 text-gray-500"
              }`}>
                <TagIcon tag="all" />
              </div>
              <span className={`text-[10px] font-medium leading-tight text-center ${
                selectedTag === null ? "text-anddine-pink" : "text-anddine-muted"
              }`}>
                All
              </span>
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className="flex flex-col items-center gap-1 w-14"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  selectedTag === tag
                    ? "bg-anddine-pink/10 ring-2 ring-anddine-pink scale-105 text-anddine-pink"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  <TagIcon tag={tag} />
                </div>
                <span className={`text-[10px] font-medium leading-tight text-center capitalize ${
                  selectedTag === tag ? "text-anddine-pink" : "text-anddine-muted"
                }`}>
                  {tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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
    </>
  )
}
