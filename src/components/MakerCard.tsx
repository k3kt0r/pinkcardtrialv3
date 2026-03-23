import Link from "next/link"
import Image from "next/image"
import { getMakerImage, getMakerBrand } from "@/lib/maker-images"
import type { OfferType } from "@/types/database"

interface MakerCardProps {
  id: string
  name: string
  address: string
  walkMinutes: number
  offers: { id: string; title: string; offer_type: OfferType }[]
  featured?: boolean
  imageUrl?: string | null
  hotCount?: number
}

export function MakerCard({ id, name, address, walkMinutes, offers, featured, imageUrl, hotCount = 0 }: MakerCardProps) {
  const image = getMakerImage(name, imageUrl)
  const brand = getMakerBrand(name)

  const hotBadge = hotCount > 0 ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-anddine-pink px-2 py-0.5 rounded-full">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
      </svg>
      {hotCount} redeemed today
    </span>
  ) : null

  if (!image) {
    return (
      <Link href={`/tap/${id}`} className="block">
        <div className={`card hover:border-anddine-pink transition-colors ${featured ? "border-anddine-pink" : ""} relative`}>
          {hotBadge && (
            <div className="absolute top-3 right-3">{hotBadge}</div>
          )}
          {featured && (
            <span className="inline-block text-xs font-semibold text-anddine-pink mb-2">
              Today&apos;s featured maker
            </span>
          )}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-anddine-text truncate">{brand}</h3>
              <p className="text-anddine-muted text-sm">{address}</p>
              <div className="flex items-center gap-1 text-anddine-muted text-sm mt-0.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="13.5" cy="3" r="2" />
                  <path d="M13.5 7c-1.1 0-2 .9-2 2v4h-2l-3.2 6.4c-.3.6.1 1.3.8 1.3.3 0 .6-.2.8-.5L10.5 15h2v5.5c0 .6.4 1 1 1s1-.4 1-1V15h1l2.6 5.2c.2.3.5.5.8.5.7 0 1.1-.7.8-1.3L16.5 13V9c0-1.1-.9-2-2-2h-1z" />
                </svg>
                <span>{walkMinutes} min walk</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {offers.map((offer) => (
              <span
                key={offer.id}
                className="text-xs px-2 py-0.5 rounded-full font-medium bg-white/20 text-anddine-muted border border-anddine-border"
              >
                {offer.title}
              </span>
            ))}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/tap/${id}`} className="block">
      <div
        className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
          featured ? "border-anddine-pink" : "border-transparent"
        }`}
        style={{ minHeight: "200px" }}
      >
        <Image
          src={image}
          alt={brand}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        <div className="relative z-10 flex flex-col justify-end h-full p-4" style={{ minHeight: "200px" }}>
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {featured ? (
              <span className="inline-block text-xs font-semibold text-white bg-anddine-pink px-2.5 py-1 rounded-full">
                Today&apos;s featured maker
              </span>
            ) : <span />}
            {hotBadge}
          </div>

          <div>
            <h3 className="font-semibold text-white text-lg">{brand}</h3>
            <p className="text-white/80 text-sm">{address}</p>
            <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="13.5" cy="3" r="2" />
                <path d="M13.5 7c-1.1 0-2 .9-2 2v4h-2l-3.2 6.4c-.3.6.1 1.3.8 1.3.3 0 .6-.2.8-.5L10.5 15h2v5.5c0 .6.4 1 1 1s1-.4 1-1V15h1l2.6 5.2c.2.3.5.5.8.5.7 0 1.1-.7.8-1.3L16.5 13V9c0-1.1-.9-2-2-2h-1z" />
              </svg>
              <span>{walkMinutes} min walk</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {offers.map((offer) => (
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
}
