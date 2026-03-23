import type { OfferType } from "@/types/database"

export function offerTypeBadge(type: OfferType): { label: string; color: string } {
  switch (type) {
    case "free_item":
      return { label: "Free item", color: "bg-green-100 text-green-700" }
    case "discount":
      return { label: "Discount", color: "bg-blue-100 text-blue-700" }
    case "upgrade":
      return { label: "Upgrade", color: "bg-purple-100 text-purple-700" }
    case "special":
      return { label: "Special", color: "bg-orange-100 text-orange-700" }
    default:
      return { label: type, color: "bg-gray-100 text-gray-700" }
  }
}
