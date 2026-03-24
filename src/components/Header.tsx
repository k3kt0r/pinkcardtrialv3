"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface HeaderProps {
  orgName?: string
  onSearch?: (query: string) => void
}

export function Header({ orgName, onSearch }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchOpen])

  const handleClose = () => {
    setSearchOpen(false)
    setSearchQuery("")
    onSearch?.("")
  }

  const handleChange = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <header className="sticky top-0 z-20 bg-anddine-pink px-4 py-3">
      <div className="flex items-center justify-between">
        {searchOpen ? (
          <div className="flex items-center gap-2 flex-1 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="flex items-center flex-1 bg-white/20 rounded-full px-3 py-1.5">
              <svg className="w-4 h-4 text-white/70 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Search makers..."
                className="bg-transparent text-white placeholder-white/50 text-sm ml-2 outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => handleChange("")} className="text-white/70 hover:text-white shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button onClick={handleClose} className="text-white/80 text-sm font-medium shrink-0">
              Cancel
            </button>
          </div>
        ) : (
          <>
            <Link href="/browse" className="flex items-center gap-2">
              <Image src="/logo.png" alt="&Dine" width={80} height={28} className="brightness-0 invert" />
              <span className="text-white font-normal text-sm opacity-80 italic">Express Card</span>
            </Link>
            <div className="flex items-center gap-3">
              {orgName && (
                <span className="text-white/80 text-xs">{orgName}</span>
              )}
              {onSearch && (
                <button onClick={() => setSearchOpen(true)} className="text-white/80 hover:text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
              <Link href="/account" className="text-white/80 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
