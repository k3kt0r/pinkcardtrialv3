"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("pwa-dismissed")) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  const handleInstall = async () => {
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setDeferredPrompt(null)
    }
    setDismissed(true)
  }

  const handleDismiss = () => {
    localStorage.setItem("pwa-dismissed", "1")
    setDismissed(true)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-md z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-lg border border-anddine-border p-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-anddine-pink flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">&D</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-anddine-text text-sm">Add &Dine to Home Screen</p>
          <p className="text-anddine-muted text-xs">Quick access to offers near you</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleDismiss}
            className="text-anddine-muted text-xs px-2 py-1"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="bg-anddine-pink text-white text-xs font-medium px-4 py-2 rounded-full"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
