"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    // Domain validation is handled server-side by the signup API
    // which always queries the database fresh

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Sign up failed")
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-anddine-pink/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-anddine-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-medium mb-2">Check your email</h1>
          <p className="text-anddine-muted">
            We sent a verification link to <span className="text-anddine-text font-medium">{email}</span>
          </p>
          <p className="text-anddine-muted text-sm mt-2">
            Click the link to verify your account, then you can sign in.
          </p>
        </div>
        <Link href="/login" className="text-anddine-pink hover:underline text-sm">
          Go to sign in
        </Link>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="&Dine" width={130} height={46} className="mx-auto mb-1" />
          <h2 className="text-lg text-anddine-text italic">Express Card</h2>
          <p className="text-anddine-muted text-sm mt-2">
            Create your account with your work email
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
              placeholder="Create a password"
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-anddine-text mb-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="input-field"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword}
            className="btn-primary w-full"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-anddine-muted text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-anddine-pink hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-anddine-muted text-xs mt-6">
          Available for Octopus Energy and Kurt Geiger employees during the pilot scheme.
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
