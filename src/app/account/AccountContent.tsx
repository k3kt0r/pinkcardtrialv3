"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AccountContentProps {
  profile: {
    name: string | null
    email: string
    orgName: string
  }
  redemptions: {
    id: string
    offerTitle: string
    makerName: string
    redeemedAt: string
    savings: number
  }[]
}

type SavingsFilter = "today" | "week" | "lifetime"

export function AccountContent({ profile, redemptions }: AccountContentProps) {
  const [name, setName] = useState(profile.name || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savingsFilter, setSavingsFilter] = useState<SavingsFilter>("lifetime")
  const router = useRouter()
  const supabase = createClient()

  const filteredSavings = useMemo(() => {
    const now = new Date()
    let cutoff: Date

    if (savingsFilter === "today") {
      cutoff = new Date(now)
      cutoff.setHours(0, 0, 0, 0)
    } else if (savingsFilter === "week") {
      cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - 7)
      cutoff.setHours(0, 0, 0, 0)
    } else {
      cutoff = new Date(0)
    }

    const filtered = redemptions.filter((r) => new Date(r.redeemedAt) >= cutoff)
    const total = filtered.reduce((sum, r) => sum + r.savings, 0)
    return { total, count: filtered.length }
  }, [redemptions, savingsFilter])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from("user_profiles")
        .update({ name })
        .eq("id", user.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/")
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="px-4 py-3">
      <Link href="/browse" className="text-anddine-pink text-sm hover:underline mb-2 inline-block">
        &larr; Back to Makers
      </Link>

      <h1 className="text-2xl font-medium mb-3">Your account</h1>

      {/* Savings tracker */}
      <div className="card mb-3">
        <p className="text-xs text-anddine-pink font-semibold mb-2 uppercase tracking-wide">Your savings</p>
        <div className="flex gap-1 bg-anddine-bg rounded-xl p-1 mb-2">
          {(["today", "week", "lifetime"] as SavingsFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setSavingsFilter(f)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                savingsFilter === f
                  ? "bg-white text-anddine-text shadow-sm"
                  : "text-anddine-muted hover:text-anddine-text"
              }`}
            >
              {f === "today" ? "Today" : f === "week" ? "This week" : "Lifetime"}
            </button>
          ))}
        </div>
        <div className="text-center py-1">
          <p className="text-4xl font-bold text-anddine-pink">
            £{filteredSavings.total.toFixed(2)}
          </p>
          <p className="text-anddine-muted text-sm mt-0.5">
            across {filteredSavings.count} {filteredSavings.count === 1 ? "offer" : "offers"}
          </p>
        </div>
      </div>

      <div className="card mb-3">
        <form onSubmit={handleSaveName} className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-anddine-text mb-0.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anddine-text mb-0.5">Email</label>
            <p className="text-anddine-muted text-sm">{profile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-anddine-text mb-0.5">Office</label>
            <p className="text-anddine-muted text-sm">{profile.orgName}</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? "Saving..." : saved ? "Saved!" : "Save name"}
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold mb-2">Redemption history</h2>

      {redemptions.length === 0 ? (
        <p className="text-anddine-muted text-sm">No redemptions yet. Visit a maker to get started!</p>
      ) : (
        <div className="space-y-1.5">
          {redemptions.map((r) => (
            <div key={r.id} className="card py-2.5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{r.offerTitle}</p>
                  <p className="text-anddine-muted text-xs">
                    {r.makerName} &middot; {formatDate(r.redeemedAt)}
                  </p>
                </div>
                <span className="text-anddine-pink text-sm font-semibold shrink-0 ml-2">
                  £{r.savings.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="mt-5 text-anddine-muted hover:text-red-500 text-sm"
      >
        Sign out
      </button>
    </main>
  )
}
