import type { Metadata, Viewport } from "next"
import "./globals.css"
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt"
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar"

export const metadata: Metadata = {
  title: "&Dine Express Card",
  description: "Your free digital perk card for independent food Makers near your office",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "&Dine",
  },
}

export const viewport: Viewport = {
  themeColor: "#ff1e5f",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen">
        <div className="mx-auto max-w-md min-h-screen">
          {children}
        </div>
        <PWAInstallPrompt />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
