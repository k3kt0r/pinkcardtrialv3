export type OfferType = "free_item" | "discount" | "upgrade" | "special"

export interface Organisation {
  id: string
  name: string
  slug: string
  allowed_domain: string
  location: string
  created_at: string
}

export interface Maker {
  id: string
  name: string
  address: string
  postcode: string
  nfc_token: string | null
  latitude: number | null
  longitude: number | null
  image_url: string | null
  created_at: string
}

export interface MakerOffice {
  id: string
  maker_id: string
  organisation_id: string
  walk_minutes: number
}

export interface Offer {
  id: string
  maker_id: string
  title: string
  description: string
  offer_type: OfferType
  active: boolean
  estimated_value: number | null
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  name: string | null
  organisation_id: string
  created_at: string
}

export interface Redemption {
  id: string
  user_id: string
  offer_id: string
  maker_id: string
  organisation_id: string
  redeemed_at: string
}

export interface FeaturedMaker {
  id: string
  organisation_id: string
  maker_id: string
  date: string
}

// Joined types for UI
export interface MakerWithOffers extends Maker {
  walk_minutes: number
  offers: Offer[]
}
