"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getMakerBrand, getMakerImage } from "@/lib/maker-images"

interface MapMaker {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
  walk_minutes: number
  image_url: string | null
  offers: { id: string; title: string }[]
}

interface MakerMapProps {
  makers: MapMaker[]
  userLocation: { lat: number; lng: number } | null
  featuredMakerId: string | null
}

export function MakerMap({ makers, userLocation, featuredMakerId }: MakerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const validMakers = makers.filter((m) => m.latitude != null && m.longitude != null)

    const center: L.LatLngExpression = userLocation
      ? [userLocation.lat, userLocation.lng]
      : validMakers.length > 0
        ? [validMakers[0].latitude!, validMakers[0].longitude!]
        : [51.515, -0.09]

    const map = L.map(containerRef.current).setView(center, 15)
    mapRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    const allMarkers: L.Marker[] = []

    validMakers.forEach((maker) => {
      const isFeatured = maker.id === featuredMakerId
      const size = isFeatured ? 44 : 36
      const color = isFeatured ? "#ff1e5f" : "#3F3A37"
      const brand = getMakerBrand(maker.name)

      const imageUrl = getMakerImage(maker.name, maker.image_url)
      const borderColor = isFeatured ? "#ff1e5f" : "white"
      const borderWidth = isFeatured ? 3 : 2

      const iconHtml = imageUrl
        ? `<div style="width:${size}px;height:${size}px;border-radius:50%;border:${borderWidth}px solid ${borderColor};box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;overflow:hidden;background:${color};">
            <img src="${imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
          </div>`
        : `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);cursor:pointer;"></div>`

      const icon = L.divIcon({
        className: "",
        html: iconHtml,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const offersText = maker.offers.length === 1 ? "1 offer" : `${maker.offers.length} offers`

      const marker = L.marker([maker.latitude!, maker.longitude!], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:160px;padding:2px 0;">
            ${isFeatured ? '<div style="color:#ff1e5f;font-size:11px;font-weight:600;margin-bottom:2px;">Featured today</div>' : ""}
            <strong style="font-size:14px;">${brand}</strong><br/>
            <span style="color:#888;font-size:12px;">${offersText} · ${maker.walk_minutes} min walk</span><br/>
            <a href="/tap/${maker.id}" style="color:#ff1e5f;font-weight:600;font-size:13px;text-decoration:none;">
              View offers &rarr;
            </a>
          </div>
        `)

      allMarkers.push(marker)
    })

    if (userLocation) {
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="position:relative;width:24px;height:24px;">
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.2);animation:pulse-ring 2s ease-in-out infinite;"></div>
          <div style="position:absolute;top:6px;left:6px;width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2px solid white;"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)
    }

    if (allMarkers.length > 0) {
      const group = L.featureGroup(allMarkers)
      map.fitBounds(group.getBounds().pad(0.15))
    }

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [makers, userLocation, featuredMakerId])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-anddine-border"
      style={{ height: "calc(100vh - 260px)", minHeight: "300px" }}
    />
  )
}
