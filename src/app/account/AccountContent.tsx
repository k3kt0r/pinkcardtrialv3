"use client"

import { useState } from "react"
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
  }[]
}

export function AccountContent({ profile, redemptions }: AccountContentProps) {
  const [name, setName] = useState(profile.name || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
    <main className="px-4 py-5">
      <Link href="/browse" className="text-anddine-pink text-sm hover:underline mb-4 inline-block">
        &larr; Back to Makers
      </Link>

      <h1 className="text-2xl font-medium mb-6">Your account</h1>

      <div className="card mb-4">
        <form onSubmit={handleSaveName} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-anddine-text mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anddine-text mb-1">Email</label>
            <p className="text-anddine-muted text-sm">{profile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-anddine-text mb-1">Office</label>
            <p className="text-anddine-muted text-sm">{profile.orgName}</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? "Saving..." : saved ? "Saved!" : "Save name"}
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold mb-3">Redemption history</h2>

      {redemptions.length === 0 ? (
        <p className="text-anddine-muted text-sm">No redemptions yet. Visit a maker to get started!</p>
      ) : (
        <div className="space-y-2">
          {redemptions.map((r) => (
            <div key={r.id} className="card py-3">
              <p className="font-medium text-sm">{r.offerTitle}</p>
              <p className="text-anddine-muted text-xs">
                {r.makerName} &middot; {formatDate(r.redeemedAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="mt-8 text-anddine-muted hover:text-red-500 text-sm"
      >
        Sign out
      </button>
    </main>
  )
}
