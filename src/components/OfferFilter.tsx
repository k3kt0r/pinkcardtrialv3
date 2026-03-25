"use client"

import type { OfferType } from "@/types/database"

const iconProps = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

const FILTER_ICONS: Record<string, JSX.Element> = {
  all: (
    <svg {...iconProps}>
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  free_item: (
    <svg {...iconProps}>
      <path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  discount: (
    <svg {...iconProps}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><circle cx="7" cy="7" r="1.5" fill="currentColor" />
    </svg>
  ),
  upgrade: (
    <svg {...iconProps}>
      <path d="M12 3l8 6-3 1 3 5H4l3-5-3-1z" />
    </svg>
  ),
  special: (
    <svg {...iconProps}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
}

const FILTERS: { value: OfferType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free_item", label: "Free item" },
  { value: "discount", label: "Discount" },
  { value: "upgrade", label: "Upgrade" },
  { value: "special", label: "Special" },
]

interface OfferFilterProps {
  active: OfferType | "all"
  onChange: (value: OfferType | "all") => void
}

export function OfferFilter({ active, onChange }: OfferFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map((filter) => (
        <button
        // it is fine to adjust button value here - HTK
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`flex items-center gap-1.5 whitespace-nowrap text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
            active === filter.value
              ? "bg-anddine-pink text-white"
              : "bg-white text-anddine-muted border border-anddine-border hover:border-anddine-pink"
          }`}
        >
          {FILTER_ICONS[filter.value]}
          {filter.label}
        </button>
      ))}
    </div>
  )
}
