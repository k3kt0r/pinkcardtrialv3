"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Login failed")
      setLoading(false)
      return
    }

    const params = new URLSearchParams(window.location.search)
    const redirect = params.get("redirect") || "/browse"
    window.location.href = redirect
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="&Dine" width={130} height={46} className="mx-auto mb-1" />
          <h2 className="text-lg text-anddine-text italic">Express Card</h2>
          <p className="text-anddine-muted text-sm mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-anddine-text mb-1">
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-anddine-text mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="input-field"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary w-full"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-anddine-muted text-sm mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-anddine-pink hover:underline">
            Sign up
          </Link>
        </p>

        <p className="text-center text-anddine-muted text-xs mt-6">
          Available for select organisations during the pilot scheme.
        </p>

        <div className="text-center mt-4">
          <Link href="/" className="text-anddine-pink hover:underline text-sm">
            Back
          </Link>
        </div>
      </div>
    </main>
  )
}
