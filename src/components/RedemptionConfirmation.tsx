"use client"

import Image from "next/image"
import Link from "next/link"

interface RedemptionConfirmationProps {
  offerTitle: string
  makerName: string
  redeemedAt: string
}

export function RedemptionConfirmation({ offerTitle, makerName, redeemedAt }: RedemptionConfirmationProps) {
  const time = new Date(redeemedAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <div className="animate-fade-in">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-anddine-pink/10 animate-pulse-ring" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-anddine-pink/10 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-anddine-pink animate-check-draw"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <Image
          src="/logo.png"
          alt="&Dine"
          width={100}
          height={35}
          className="mx-auto mb-4"
        />

        <h1 className="text-2xl font-medium mb-1">Thanks for verifying</h1>
        <p className="text-anddine-muted text-sm mb-6">Show this screen to the counter staff</p>

        <div className="card inline-block text-left mx-auto">
          <p className="text-anddine-pink text-xs font-semibold mb-1">Your offer</p>
          <h2 className="text-lg font-semibold text-anddine-text">{offerTitle}</h2>
          <p className="text-anddine-muted text-sm">{makerName}</p>
          <p className="text-anddine-muted text-xs mt-2">Verified at <span className="font-bold">{time}</span></p>
        </div>

        <p className="text-anddine-muted text-xs mt-6">One offer per day. Resets at midnight.</p>
      </div>

      <Link href="/browse" className="btn-secondary mt-8">
        Back to Makers
      </Link>
    </main>
  )
}
