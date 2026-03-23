import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "anddine-pink": "#ff1e5f",
        "anddine-logo": "#E01854",
        "anddine-bg": "#FAF9F7",
        "anddine-border": "#ECEAE7",
        "anddine-text": "#3F3A37",
        "anddine-muted": "#888780",
        "anddine-gold": "#EF9F27",
        "anddine-gold-base": "#1a1a1a",
      },
      fontFamily: {
        sans: ["Galano Grotesque", "sans-serif"],
      },
      borderRadius: {
        button: "12px",
        input: "8px",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
}

export default config
