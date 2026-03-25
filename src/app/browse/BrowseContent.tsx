"use client"

import { useState, useEffect, useMemo, useRef } from "react"
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
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")
  const [locationResults, setLocationResults] = useState<{ name: string; lat: number; lng: number }[]>([])
  const [locationSearching, setLocationSearching] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)

  // Debounced address search
  useEffect(() => {
    if (locationSearch.length < 2) {
      setLocationResults([])
      return
    }
    setLocationSearching(true)
    const timer = setTimeout(() => {
      fetch(`/api/geocode/search?q=${encodeURIComponent(locationSearch)}`)
        .then((r) => r.json())
        .then((data) => setLocationResults(data))
        .catch(() => setLocationResults([]))
        .finally(() => setLocationSearching(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [locationSearch])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (locationDropdownOpen && locationInputRef.current) {
      locationInputRef.current.focus()
    }
    if (!locationDropdownOpen) {
      setLocationSearch("")
      setLocationResults([])
    }
  }, [locationDropdownOpen])

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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
    <Header searchQuery={searchQuery} onSearch={setSearchQuery} />
    <main className="px-4 py-3 animate-fade-in">
      <div ref={locationRef} className="relative mb-2">
        <button
          onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
          className="flex items-center gap-2 text-left"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 447.342 447.342" fill="#ef4444" stroke="none">
            <path d="M443.537,3.805c-3.84-3.84-9.686-4.893-14.625-2.613L7.553,195.239c-4.827,2.215-7.807,7.153-7.535,12.459c0.254,5.305,3.727,9.908,8.762,11.63l129.476,44.289c21.349,7.314,38.125,24.089,45.438,45.438l44.321,129.509c1.72,5.018,6.325,8.491,11.63,8.762c5.306,0.271,10.244-2.725,12.458-7.535L446.15,18.429C448.428,13.491,447.377,7.644,443.537,3.805z" />
          </svg>
          <span className="text-lg font-medium">
            {locationName || "Select location"}
          </span>
          <svg className={`w-4 h-4 text-anddine-muted shrink-0 transition-transform duration-200 ${locationDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {locationDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-anddine-border z-30 py-1">
            <div className="px-3 py-2">
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5">
                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={locationInputRef}
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  placeholder="Search an address..."
                  className="bg-transparent text-sm ml-2 outline-none w-full text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              <button
                onClick={() => {
                  navigator.geolocation?.getCurrentPosition(
                    (pos) => {
                      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                      setLocationStatus("granted")
                      fetch(`/api/geocode?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
                        .then((r) => r.json())
                        .then((d) => { if (d.name) setLocationName(d.name) })
                        .catch(() => {})
                    },
                    () => {},
                    { enableHighAccuracy: true, timeout: 10000 }
                  )
                  setLocationDropdownOpen(false)
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-anddine-pink font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
                </svg>
                Use my location
              </button>

              {locationSearching && (
                <p className="px-4 py-2.5 text-sm text-gray-400">Searching...</p>
              )}

              {locationResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const shortName = result.name.split(",")[0]?.trim() || result.name
                    setLocationName(shortName)
                    setUserLocation({ lat: result.lat, lng: result.lng })
                    setLocationDropdownOpen(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700 leading-snug"
                >
                  <span className="font-medium">{result.name.split(",")[0]}</span>
                  <span className="text-gray-400">{result.name.includes(",") ? "," + result.name.split(",").slice(1, 3).join(",") : ""}</span>
                </button>
              ))}

              {!locationSearching && locationSearch.length >= 2 && locationResults.length === 0 && (
                <p className="px-4 py-2.5 text-sm text-gray-400">No results found</p>
              )}
            </div>
          </div>
        )}
      </div>

      <TrendingCarousel orgId={orgId} userLocation={userLocation} />

      {/* Food category filter */}
      {availableTags.length > 0 && (
        <div className="overflow-x-auto mb-1.5 scrollbar-hide">
          <div className="flex gap-3 w-max">
            <button
              onClick={() => setSelectedTag(null)}
              className="flex flex-col items-center gap-1 w-14"
            >
              <div className={`flex items-center justify-center w-11 h-11 transition-all ${
                selectedTag === null
                  ? "scale-110 text-anddine-pink"
                  : "text-gray-400"
              }`}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                </svg>
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
                <div className={`flex items-center justify-center w-11 h-11 transition-all ${
                  selectedTag === tag
                    ? "scale-110"
                    : ""
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
      <div className="flex items-center justify-between mt-2 mb-2">
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
