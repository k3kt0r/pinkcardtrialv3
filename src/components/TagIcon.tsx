const svgProps = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

const icons: Record<string, JSX.Element> = {
  all: (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  ),
  breakfast: (
    <svg {...svgProps}>
      <circle cx="12" cy="13" r="4" fill="currentColor" opacity={0.15} />
      <ellipse cx="12" cy="14" rx="9" ry="5" />
      <path d="M12 9c0-3 2-5 5-5" />
    </svg>
  ),
  lunch: (
    <svg {...svgProps}>
      <rect x="4" y="7" width="16" height="10" rx="2" fill="currentColor" opacity={0.15} />
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
  ),
  dinner: (
    <svg {...svgProps}>
      <circle cx="12" cy="13" r="8" fill="currentColor" opacity={0.15} />
      <circle cx="12" cy="13" r="8" />
      <circle cx="12" cy="13" r="5" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  ),
  coffee: (
    <svg {...svgProps}>
      <path d="M5 9h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1" />
      <rect x="3" y="9" width="14" height="9" rx="2" fill="currentColor" opacity={0.15} />
      <rect x="3" y="9" width="14" height="9" rx="2" />
      <path d="M7 5c0-1 1-2 2-2M10 6c0-1 1-2 2-2" />
      <line x1="3" y1="21" x2="17" y2="21" />
    </svg>
  ),
  drinks: (
    <svg {...svgProps}>
      <path d="M8 21h8M12 15v6M6 3l2 12h8l2-12" fill="currentColor" opacity={0.15} />
      <path d="M6 3l2 12h8l2-12H6z" />
      <line x1="7" y1="8" x2="17" y2="8" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
    </svg>
  ),
  healthy: (
    <svg {...svgProps}>
      <path d="M12 21C12 21 4 15 4 9a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 6-8 12-8 12z" fill="currentColor" opacity={0.15} />
      <path d="M12 21C12 21 4 15 4 9a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 6-8 12-8 12z" />
      <path d="M12 13V9l-2-2" />
    </svg>
  ),
  vegan: (
    <svg {...svgProps}>
      <path d="M12 22c-4 0-7-3-7-8 0-6 7-12 7-12s7 6 7 12c0 5-3 8-7 8z" fill="currentColor" opacity={0.15} />
      <path d="M12 22c-4 0-7-3-7-8 0-6 7-12 7-12s7 6 7 12c0 5-3 8-7 8z" />
      <path d="M12 22v-9M12 16c-2-2-3-4-3-6M12 14c2-2 3-4 3-6" />
    </svg>
  ),
  vegetarian: (
    <svg {...svgProps}>
      <path d="M17 4c0 6-5 10-5 16" />
      <path d="M7 4c3 0 6 2 7 6" fill="currentColor" opacity={0.15} />
      <path d="M7 4c3 0 6 2 7 6" />
      <path d="M17 4c-3 0-6 2-7 6" fill="currentColor" opacity={0.15} />
      <path d="M17 4c-3 0-6 2-7 6" />
    </svg>
  ),
  "gluten-free": (
    <svg {...svgProps}>
      <path d="M12 3v18M9 6c0 2 3 2 3 4s-3 2-3 4 3 2 3 4" />
      <path d="M15 6c0 2-3 2-3 4s3 2 3 4-3 2-3 4" />
      <line x1="4" y1="4" x2="20" y2="20" strokeWidth={2} />
    </svg>
  ),
  thai: (
    <svg {...svgProps}>
      <path d="M5 16c0 2 3 4 7 4s7-2 7-4" fill="currentColor" opacity={0.15} />
      <path d="M5 16c0 2 3 4 7 4s7-2 7-4" />
      <ellipse cx="12" cy="16" rx="9" ry="3" />
      <path d="M6 13c1-4 3-7 3-10M12 13V4M18 13c-1-4-3-7-3-10" />
    </svg>
  ),
  indian: (
    <svg {...svgProps}>
      <path d="M4 18h16l-2-8H6z" fill="currentColor" opacity={0.15} />
      <path d="M4 18h16l-2-8H6z" />
      <line x1="4" y1="21" x2="20" y2="21" />
      <path d="M10 10V6c0-1 1-2 2-2s2 1 2 2v4" />
    </svg>
  ),
  italian: (
    <svg {...svgProps}>
      <ellipse cx="12" cy="16" rx="8" ry="4" fill="currentColor" opacity={0.15} />
      <ellipse cx="12" cy="16" rx="8" ry="4" />
      <path d="M8 14c1-3 0-6-1-9h10c-1 3-2 6-1 9" fill="currentColor" opacity={0.1} />
      <path d="M8 14c1-3 0-6-1-9h10c-1 3-2 6-1 9" />
    </svg>
  ),
  mexican: (
    <svg {...svgProps}>
      <path d="M3 12c0 0 2 8 9 8s9-8 9-8" fill="currentColor" opacity={0.15} />
      <path d="M3 12c0 0 2 8 9 8s9-8 9-8" />
      <path d="M3 12h18" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
      <circle cx="14" cy="14" r="1" fill="currentColor" />
    </svg>
  ),
  japanese: (
    <svg {...svgProps}>
      <circle cx="12" cy="10" r="6" fill="currentColor" opacity={0.15} />
      <circle cx="12" cy="10" r="6" />
      <circle cx="12" cy="10" r="2" fill="currentColor" opacity={0.3} />
      <line x1="3" y1="20" x2="10" y2="14" />
      <line x1="14" y1="14" x2="21" y2="20" />
    </svg>
  ),
  chinese: (
    <svg {...svgProps}>
      <path d="M6 12a6 6 0 0 0 12 0" fill="currentColor" opacity={0.15} />
      <path d="M3 12h18M6 12a6 6 0 0 0 12 0" />
      <line x1="3" y1="4" x2="12" y2="12" />
      <line x1="21" y1="4" x2="12" y2="12" />
    </svg>
  ),
  vietnamese: (
    <svg {...svgProps}>
      <path d="M4 11c0 5 3.5 9 8 9s8-4 8-9" fill="currentColor" opacity={0.15} />
      <path d="M4 11c0 5 3.5 9 8 9s8-4 8-9H4z" />
      <path d="M8 8c0-2 1.5-4 4-4s4 2 4 4" />
      <path d="M9 13h2M13 15h2" />
    </svg>
  ),
  mediterranean: (
    <svg {...svgProps}>
      <ellipse cx="12" cy="14" rx="3" ry="5" fill="currentColor" opacity={0.15} />
      <ellipse cx="12" cy="14" rx="3" ry="5" />
      <path d="M12 9V3M10 5h4" />
      <path d="M8 11c-2-1-4 0-4 2s2 3 4 2M16 11c2-1 4 0 4 2s-2 3-4 2" />
    </svg>
  ),
  burgers: (
    <svg {...svgProps}>
      <path d="M4 13h16" />
      <path d="M4 10c0-3 3.5-6 8-6s8 3 8 6H4z" fill="currentColor" opacity={0.15} />
      <path d="M4 10c0-3 3.5-6 8-6s8 3 8 6H4z" />
      <path d="M5 16c0 2 3 3 7 3s7-1 7-3H5z" fill="currentColor" opacity={0.15} />
      <path d="M5 16c0 2 3 3 7 3s7-1 7-3H5z" />
      <circle cx="8" cy="13" r="0.5" fill="currentColor" />
      <circle cx="12" cy="13" r="0.5" fill="currentColor" />
      <circle cx="16" cy="13" r="0.5" fill="currentColor" />
    </svg>
  ),
  pizza: (
    <svg {...svgProps}>
      <path d="M12 2L3 20h18z" fill="currentColor" opacity={0.15} />
      <path d="M12 2L3 20h18z" />
      <circle cx="10" cy="14" r="1.5" fill="currentColor" opacity={0.3} />
      <circle cx="14" cy="11" r="1.5" fill="currentColor" opacity={0.3} />
      <circle cx="11" cy="8" r="1" fill="currentColor" opacity={0.3} />
    </svg>
  ),
  sushi: (
    <svg {...svgProps}>
      <ellipse cx="12" cy="15" rx="8" ry="4" fill="currentColor" opacity={0.15} />
      <ellipse cx="12" cy="15" rx="8" ry="4" />
      <ellipse cx="12" cy="13" rx="6" ry="3" fill="currentColor" opacity={0.2} />
      <ellipse cx="12" cy="13" rx="6" ry="3" />
      <ellipse cx="12" cy="12" rx="3" ry="1.5" fill="currentColor" opacity={0.3} />
    </svg>
  ),
  salads: (
    <svg {...svgProps}>
      <path d="M4 14c0 4 3.5 7 8 7s8-3 8-7" fill="currentColor" opacity={0.15} />
      <path d="M4 14c0 4 3.5 7 8 7s8-3 8-7H4z" />
      <path d="M8 14c1-3 0-5-1-8M12 14V5M16 14c-1-3 0-5 1-8" />
    </svg>
  ),
  sandwiches: (
    <svg {...svgProps}>
      <path d="M3 15l9-11 9 11z" fill="currentColor" opacity={0.15} />
      <path d="M3 15l9-11 9 11z" />
      <path d="M5 15c1 3 3 5 7 5s6-2 7-5" fill="currentColor" opacity={0.15} />
      <path d="M5 15c1 3 3 5 7 5s6-2 7-5" />
      <line x1="6" y1="13" x2="18" y2="13" />
    </svg>
  ),
  wraps: (
    <svg {...svgProps}>
      <path d="M6 4c0 0 0 16 6 16s6-16 6-16" fill="currentColor" opacity={0.15} />
      <path d="M6 4c0 0 0 16 6 16s6-16 6-16" />
      <path d="M8 7c1 1 2 1 3 0s2-1 3 0" />
      <path d="M9 11c1 1 2 1 3 0" />
    </svg>
  ),
  bakery: (
    <svg {...svgProps}>
      <path d="M4 16c0 2 3.5 4 8 4s8-2 8-4c0-2-2-3-3-5s-1-5-5-5-4 3-5 5-3 3-3 5z" fill="currentColor" opacity={0.15} />
      <path d="M4 16c0 2 3.5 4 8 4s8-2 8-4c0-2-2-3-3-5s-1-5-5-5-4 3-5 5-3 3-3 5z" />
      <path d="M9 10v7M12 9v8M15 10v7" />
    </svg>
  ),
  desserts: (
    <svg {...svgProps}>
      <path d="M8 20h8M9 14h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" fill="currentColor" opacity={0.15} />
      <path d="M8 20h8M9 14h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
      <path d="M8 14c0-4 1-6 4-10 3 4 4 6 4 10" />
      <circle cx="12" cy="6" r="1" fill="currentColor" />
    </svg>
  ),
  "street food": (
    <svg {...svgProps}>
      <line x1="12" y1="2" x2="12" y2="22" />
      <circle cx="12" cy="7" r="2.5" fill="currentColor" opacity={0.15} />
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="12" cy="13" r="2" fill="currentColor" opacity={0.2} />
      <circle cx="12" cy="13" r="2" />
      <circle cx="12" cy="18" r="1.5" fill="currentColor" opacity={0.25} />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  ),
  "meal deal": (
    <svg {...svgProps}>
      <circle cx="12" cy="12" r="9" fill="currentColor" opacity={0.15} />
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12h6M8 9h8M8 15h8" />
      <text x="12" y="13" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">£</text>
    </svg>
  ),
}

export function TagIcon({ tag, className }: { tag: string; className?: string }) {
  return (
    <span className={className}>
      {icons[tag] || icons.all}
    </span>
  )
}
