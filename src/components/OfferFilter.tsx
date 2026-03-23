"use client"

import type { OfferType } from "@/types/database"

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
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full font-medium transition-colors ${
            active === filter.value
              ? "bg-anddine-pink text-white"
              : "bg-white text-anddine-muted border border-anddine-border hover:border-anddine-pink"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
