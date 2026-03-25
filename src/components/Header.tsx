"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface HeaderProps {
  orgName?: string
  searchQuery?: string
  onSearch?: (query: string) => void
}

export function Header({ onSearch, searchQuery = "" }: HeaderProps) {
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded])

  const handleClose = () => {
    setExpanded(false)
    onSearch?.("")
  }

  return (
    <header className="sticky top-0 z-20 bg-anddine-pink px-4 py-3">
      <div className="flex items-center gap-3 h-7">
        {/* Logo + Express Card — fade out when search expands */}
        <div className={`flex items-center gap-2 shrink-0 transition-all duration-300 ${expanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
          <Link href="/browse" className="flex items-center gap-2">
            <Image src="/logo.png" alt="&Dine" width={80} height={28} className="brightness-0 invert" />
            <span className="text-white font-normal text-sm opacity-80 italic whitespace-nowrap">Express Card</span>
          </Link>
        </div>

        {/* Spacer pushes right items to the end */}
        <div className="flex-1" />

        {/* Search pill / expanded bar */}
        {onSearch && (
          <div
            onClick={() => !expanded && setExpanded(true)}
            className={`flex items-center bg-white rounded-full transition-all duration-300 ease-in-out ${
              expanded ? "flex-1 absolute left-4 right-20 px-3 py-1 z-10" : "w-7 h-7 justify-center cursor-pointer shrink-0"
            }`}
          >
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {expanded && (
              <>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Search makers..."
                  className="bg-transparent text-gray-800 placeholder-gray-400 text-sm ml-2 outline-none w-full"
                />
                {searchQuery && (
                  <button onClick={() => onSearch("")} className="text-gray-400 hover:text-gray-600 shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {expanded ? (
          <button onClick={handleClose} className="text-white/80 text-sm font-medium shrink-0 z-10">
            Cancel
          </button>
        ) : (
          <Link href="/account" className="text-white/80 hover:text-white shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  )
}
