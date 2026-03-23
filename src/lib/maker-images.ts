const MAKER_IMAGE_MAP: { pattern: string; image: string; brand: string }[] = [
  { pattern: "B Bagel", image: "/makers/b-bagel.png", brand: "B Bagel" },
  { pattern: "Eat Activ", image: "/makers/eat-activ.png", brand: "Eat Activ" },
  { pattern: "Lantana", image: "/makers/lantana.png", brand: "Lantana" },
  { pattern: "Pali Kitchen", image: "/makers/pali-kitchen.png", brand: "Pali Kitchen" },
  { pattern: "The Salad Project", image: "/makers/the-salad-project.png", brand: "The Salad Project" },
  { pattern: "The Salad Kitchen", image: "/makers/the-salad-kitchen.png", brand: "The Salad Kitchen" },
  { pattern: "Papa-Dum", image: "/makers/papa-dum.png", brand: "Papa-Dum" },
  { pattern: "Koshari Street", image: "/makers/koshari-street.png", brand: "Koshari Street" },
  { pattern: "Crust Bros", image: "/makers/crust-bros.png", brand: "Crust Bros" },
  { pattern: "Old Chang Kee", image: "/makers/old-chang-kee.png", brand: "Old Chang Kee" },
  { pattern: "Thunderbird", image: "/makers/thunderbird.png", brand: "Thunderbird" },
  { pattern: "atis", image: "/makers/atis.png", brand: "atis" },
  { pattern: "Katsuma", image: "/makers/katsuma.png", brand: "Katsuma" },
  { pattern: "Hola Guacamole", image: "/makers/hola-guacamole.png", brand: "Hola Guacamole" },
  { pattern: "Bonata", image: "/makers/bonata.png", brand: "Bonata" },
  { pattern: "Little Banh Banh", image: "/makers/little-banh-banh.png", brand: "Little Banh Banh" },
  { pattern: "K10", image: "/makers/k10.png", brand: "K10" },
  { pattern: "Rice Guys", image: "/makers/rice-guys.png", brand: "Rice Guys" },
]

export function getMakerImage(name: string, imageUrl?: string | null): string | null {
  if (imageUrl) return imageUrl
  const match = MAKER_IMAGE_MAP.find((m) => name.startsWith(m.pattern))
  return match?.image ?? null
}

export function getMakerBrand(name: string): string {
  const match = MAKER_IMAGE_MAP.find((m) => name.startsWith(m.pattern))
  return match?.brand ?? name
}
