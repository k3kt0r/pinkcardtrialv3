import Image from "next/image"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Map tag names to their exact filenames in the tag-images bucket
const tagFileMap: Record<string, string> = {
  breakfast: "Breakfast.png",
  lunch: "lunch.png",
  coffee: "coffee.png",
  dinner: "dinner.png",
  healthy: "healthy.png",
  vegan: "vegan.png",
  vegetarian: "vegetarian.png",
  "gluten-free": "gluten free.png",
  burgers: "burgers.png",
  pizza: "pizza.png",
  sushi: "sushi.png",
  sandwiches: "sandwiches.png",
  wraps: "wraps.png",
  salads: "Salad.png",
  thai: "thai.png",
  indian: "indian.png",
  italian: "italian.png",
  japanese: "japanese.png",
  chinese: "chinese.png",
  vietnamese: "vietnamese.png",
  mexican: "mexican.png",
  mediterranean: "mediterranean.png",
  bakery: "bakery.png",
  desserts: "desserts.png",
  "street food": "street food.png",
  drinks: "drinks.png",
  "meal deal": "meal deals.png",
}

function getTagImageUrl(tag: string): string | null {
  const file = tagFileMap[tag]
  if (!file) return null
  return `${SUPABASE_URL}/storage/v1/object/public/tag-images/${encodeURIComponent(file)}`
}

export function TagIcon({ tag, className }: { tag: string; className?: string }) {
  const url = getTagImageUrl(tag)

  if (!url) {
    // Fallback for "all" or unknown tags — simple plus icon
    return (
      <span className={className}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      </span>
    )
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={url}
        alt={tag}
        fill
        className="object-contain"
        sizes="44px"
      />
    </div>
  )
}
