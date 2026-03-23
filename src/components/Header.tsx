import Link from "next/link"
import Image from "next/image"

interface HeaderProps {
  orgName?: string
}

export function Header({ orgName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-anddine-pink px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/browse" className="flex items-center gap-2">
          <Image src="/logo.png" alt="&Dine" width={80} height={28} className="brightness-0 invert" />
          <span className="text-white font-normal text-sm opacity-80 italic">Express Card</span>
        </Link>
        <div className="flex items-center gap-3">
          {orgName && (
            <span className="text-white/80 text-xs">{orgName}</span>
          )}
          <Link href="/account" className="text-white/80 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}
