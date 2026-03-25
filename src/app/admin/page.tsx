"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { getMakerImage, getMakerBrand } from "@/lib/maker-images"
import type { OfferType } from "@/types/database"

const MAKER_TAGS = [
  "breakfast", "lunch", "dinner", "coffee", "drinks",
  "healthy", "vegan", "vegetarian", "gluten-free",
  "thai", "indian", "italian", "mexican", "japanese", "chinese", "vietnamese", "mediterranean",
  "burgers", "pizza", "sushi", "salads", "sandwiches", "wraps",
  "bakery", "desserts", "street food", "meal deal",
] as const

interface Offer {
  id: string
  title: string
  description: string | null
  offer_type: OfferType
  active: boolean
  estimated_value: number | null
}

interface Maker {
  id: string
  name: string
  address: string
  postcode: string
  latitude: number | null
  longitude: number | null
  nfc_token: string | null
  image_url: string | null
  tags: string[]
  offers: Offer[]
}

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState("")
  const [activeTab, setActiveTab] = useState<"makers" | "orgs" | "metrics">("makers")
  const [makers, setMakers] = useState<Maker[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedMaker, setExpandedMaker] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Maker form
  const [editingMaker, setEditingMaker] = useState<Maker | null>(null)
  const [makerForm, setMakerForm] = useState({ name: "", address: "", postcode: "", tags: [] as string[] })
  const [showMakerForm, setShowMakerForm] = useState(false)

  // Offer form
  const [offerForm, setOfferForm] = useState({ title: "", description: "", offer_type: "free_item" as OfferType, estimated_value: "" })
  const [addingOfferFor, setAddingOfferFor] = useState<string | null>(null)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [editOfferForm, setEditOfferForm] = useState({ title: "", description: "", offer_type: "free_item" as OfferType, estimated_value: "" })
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)

  // Organisations
  interface Org { id: string; name: string; slug: string; allowed_domain: string; location: string; total_savings: number }
  const [orgs, setOrgs] = useState<Org[]>([])
  const [showOrgForm, setShowOrgForm] = useState(false)
  const [orgForm, setOrgForm] = useState({ name: "", allowed_domain: "", location: "" })

  // Metrics
  interface MetricsData {
    totalRedemptions: number
    totalSavings: number
    topOffers: Array<{ offer_id: string; title: string; count: number }>
    topMakers: Array<{ maker_id: string; name: string; count: number }>
    topOrgs: Array<{ organisation_id: string; name: string; count: number; savings: number }>
    makersByOrg: Array<{
      organisation_id: string
      organisation_name: string
      total_redemptions: number
      topMakers: Array<{ maker_id: string; name: string; count: number }>
    }>
  }
  type MetricRange = "day" | "week" | "month" | "year" | "all"
  const [metricsCache, setMetricsCache] = useState<Partial<Record<MetricRange, MetricsData>>>({})
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null)
  const [cardRanges, setCardRanges] = useState<Record<string, MetricRange>>({
    total: "all",
    offers: "all",
    makers: "all",
    savings: "all",
    makersByOrg: "all",
  })

  const storedPassword = typeof window !== "undefined" ? sessionStorage.getItem("admin_pw") : null

  useEffect(() => {
    if (storedPassword) {
      setPassword(storedPassword)
      setAuthed(true)
    }
  }, [storedPassword])

  const fetchMakers = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/makers", {
      headers: { authorization: password },
    })
    if (res.ok) {
      const data = await res.json()
      setMakers(data)
    }
    setLoading(false)
  }, [password])

  const fetchOrgs = useCallback(async () => {
    const res = await fetch("/api/admin/organisations", {
      headers: { authorization: password },
    })
    if (res.ok) {
      const data = await res.json()
      setOrgs(data)
    }
  }, [password])

  const fetchMetricsForRange = useCallback(async (range: MetricRange) => {
    const res = await fetch(`/api/admin/metrics?range=${range}`, {
      headers: { authorization: password },
    })
    if (res.ok) {
      const data = await res.json()
      setMetricsCache((prev) => ({ ...prev, [range]: data }))
    }
  }, [password])

  const fetchMetrics = useCallback(async () => {
    setMetricsLoading(true)
    await fetchMetricsForRange("all")
    setMetricsLoading(false)
  }, [fetchMetricsForRange])

  useEffect(() => {
    if (authed) {
      fetchMakers()
      fetchOrgs()
    }
  }, [authed, fetchMakers, fetchOrgs])

  useEffect(() => {
    if (authed && activeTab === "metrics" && !metricsCache.all) {
      fetchMetrics()
    }
  }, [authed, activeTab, metricsCache.all, fetchMetrics])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthError("")
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      sessionStorage.setItem("admin_pw", password)
      setAuthed(true)
    } else {
      setAuthError("Incorrect password")
    }
  }

  async function saveMaker(e: React.FormEvent) {
    e.preventDefault()
    const body = {
      name: makerForm.name,
      address: makerForm.address,
      postcode: makerForm.postcode,
      tags: makerForm.tags,
    }

    const url = editingMaker ? `/api/admin/makers/${editingMaker.id}` : "/api/admin/makers"
    const method = editingMaker ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", authorization: password },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      setShowMakerForm(false)
      setEditingMaker(null)
      setMakerForm({ name: "", address: "", postcode: "", tags: [] as string[] })
      fetchMakers()
    }
  }

  async function deleteMaker(id: string) {
    if (!confirm("Delete this maker and all their offers?")) return
    await fetch(`/api/admin/makers/${id}`, {
      method: "DELETE",
      headers: { authorization: password },
    })
    fetchMakers()
  }

  async function saveOffer(e: React.FormEvent, makerId: string) {
    e.preventDefault()
    const res = await fetch("/api/admin/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: password },
      body: JSON.stringify({ maker_id: makerId, title: offerForm.title, description: offerForm.description, offer_type: offerForm.offer_type, estimated_value: offerForm.estimated_value ? parseFloat(offerForm.estimated_value) : null }),
    })
    if (res.ok) {
      setAddingOfferFor(null)
      setOfferForm({ title: "", description: "", offer_type: "free_item", estimated_value: "" })
      fetchMakers()
    }
  }

  async function toggleOffer(offer: Offer) {
    await fetch(`/api/admin/offers/${offer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: password },
      body: JSON.stringify({ ...offer, active: !offer.active }),
    })
    fetchMakers()
  }

  async function updateOffer(e: React.FormEvent) {
    e.preventDefault()
    if (!editingOffer) return
    await fetch(`/api/admin/offers/${editingOffer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", authorization: password },
      body: JSON.stringify({ title: editOfferForm.title, description: editOfferForm.description, offer_type: editOfferForm.offer_type, estimated_value: editOfferForm.estimated_value ? parseFloat(editOfferForm.estimated_value) : null, active: editingOffer.active }),
    })
    setEditingOffer(null)
    fetchMakers()
  }

  function startEditOffer(offer: Offer) {
    setEditingOffer(offer)
    setEditOfferForm({ title: offer.title, description: offer.description || "", offer_type: offer.offer_type, estimated_value: offer.estimated_value?.toString() || "" })
  }

  async function regenerateNfc(makerId: string, currentToken: string | null) {
    if (!currentToken) {
      await fetch(`/api/admin/makers/${makerId}/nfc`, {
        method: "POST",
        headers: { authorization: password },
      })
      fetchMakers()
      return
    }

    const input = prompt(`⚠️ WARNING: This will permanently invalidate the current NFC tag. If the physical tag is already locked, it cannot be reprogrammed.\n\nTo confirm, type the full current NFC token:\n${currentToken}`)
    if (input !== currentToken) {
      if (input !== null) alert("Token did not match. Regeneration cancelled.")
      return
    }
    await fetch(`/api/admin/makers/${makerId}/nfc`, {
      method: "POST",
      headers: { authorization: password },
    })
    fetchMakers()
  }

  async function uploadImage(makerId: string, file: File) {
    setUploadingImage(makerId)
    const formData = new FormData()
    formData.append("image", file)
    await fetch(`/api/admin/makers/${makerId}/image`, {
      method: "POST",
      headers: { authorization: password },
      body: formData,
    })
    setUploadingImage(null)
    fetchMakers()
  }

  async function removeImage(makerId: string) {
    if (!confirm("Remove this maker's image?")) return
    await fetch(`/api/admin/makers/${makerId}/image`, {
      method: "DELETE",
      headers: { authorization: password },
    })
    fetchMakers()
  }

  async function deleteOffer(id: string) {
    if (!confirm("Delete this offer?")) return
    await fetch(`/api/admin/offers/${id}`, {
      method: "DELETE",
      headers: { authorization: password },
    })
    fetchMakers()
  }

  function startEditMaker(maker: Maker) {
    setEditingMaker(maker)
    setMakerForm({
      name: maker.name,
      address: maker.address,
      postcode: maker.postcode,
      tags: maker.tags || [],
    })
    setShowMakerForm(true)
  }

  async function addOrg(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/admin/organisations", {
      method: "POST",
      headers: { "Content-Type": "application/json", authorization: password },
      body: JSON.stringify(orgForm),
    })
    if (res.ok) {
      setShowOrgForm(false)
      setOrgForm({ name: "", allowed_domain: "", location: "" })
      fetchOrgs()
    } else {
      const data = await res.json()
      alert(data.error || "Failed to add organisation")
    }
  }

  async function resetOrgRedemptions(id: string, name: string) {
    if (!confirm(`Reset all of today's redemptions for "${name}"? Users will be able to redeem again today.`)) return
    const res = await fetch(`/api/admin/organisations/${id}/reset-redemptions`, {
      method: "POST",
      headers: { authorization: password },
    })
    if (res.ok) {
      const data = await res.json()
      alert(`Reset complete — ${data.deleted} redemption${data.deleted !== 1 ? "s" : ""} cleared for ${name}.`)
    } else {
      const data = await res.json()
      alert(data.error || "Failed to reset redemptions")
    }
  }

  async function handleCsvExport() {
    const res = await fetch("/api/admin/metrics/csv", {
      headers: { authorization: password },
    })
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "anddine_metrics.xlsx"
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  async function deleteOrg(id: string, name: string) {
    if (!confirm(`Remove "${name}" and its domain? Existing users from this organisation will keep their accounts but new sign-ups will be blocked.`)) return
    const res = await fetch(`/api/admin/organisations/${id}`, {
      method: "DELETE",
      headers: { authorization: password },
    })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || "Failed to delete organisation")
    }
    fetchOrgs()
  }

  // Password gate
  if (!authed) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="&Dine" width={130} height={46} className="mx-auto mb-1" />
            <h2 className="text-lg text-anddine-text italic">Express Card (Admin)</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter staff password"
                required
                className="input-field"
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
          </form>
          <div className="text-center mt-4">
            <Link href="/" className="text-anddine-pink hover:underline text-sm">Back</Link>
          </div>
        </div>
      </main>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-anddine-bg">
      <header className="sticky top-0 z-20 bg-anddine-pink px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="&Dine" width={80} height={28} className="brightness-0 invert" />
            <span className="text-white font-normal text-sm opacity-80 italic">Express Card (Admin)</span>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem("admin_pw"); setAuthed(false) }}
            className="text-white/80 hover:text-white text-sm"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="px-4 py-5 max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-anddine-bg border border-anddine-border rounded-xl p-1">
          <button
            onClick={() => setActiveTab("makers")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "makers" ? "bg-white text-anddine-text shadow-sm" : "text-anddine-muted hover:text-anddine-text"}`}
          >
            Makers
          </button>
          <button
            onClick={() => setActiveTab("orgs")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "orgs" ? "bg-white text-anddine-text shadow-sm" : "text-anddine-muted hover:text-anddine-text"}`}
          >
            Organisations
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === "metrics" ? "bg-white text-anddine-text shadow-sm" : "text-anddine-muted hover:text-anddine-text"}`}
          >
            Metrics
          </button>
        </div>

        {activeTab === "makers" && (<>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-medium">Makers</h1>
            <p className="text-anddine-muted text-xs mt-0.5">Manage which makers are part of &amp;Dine Express</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const headers = ["name", "address", "postcode", "nfc_token", "id", "offers"]
                const rows = makers.map((m) => [
                  m.name,
                  m.address,
                  m.postcode,
                  m.nfc_token || "",
                  m.id,
                  m.offers.map((o) => o.title).join("; "),
                ].map((v) => v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v).join(","))
                const csv = [headers.join(","), ...rows].join("\n")
                const blob = new Blob([csv], { type: "text/csv" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "makers.csv"
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="text-sm px-4 py-2 rounded-xl border border-anddine-border text-anddine-text hover:bg-anddine-bg"
            >
              Export CSV
            </button>

            <button
              onClick={() => {
                setEditingMaker(null)
                setMakerForm({ name: "", address: "", postcode: "", tags: [] as string[] })
                setShowMakerForm(true)
              }}
              className="btn-primary text-sm px-4 py-2"
            >
              + Add Maker
            </button>
          </div>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search makers by name, address or postcode..."
          className="input-field mb-4"
        />

        {/* Maker form modal */}
        {showMakerForm && (
          <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-lg font-medium mb-4">{editingMaker ? "Edit Maker" : "Add Maker"}</h2>
              <form onSubmit={saveMaker} className="space-y-3">
                <input
                  type="text"
                  value={makerForm.name}
                  onChange={(e) => setMakerForm({ ...makerForm, name: e.target.value })}
                  placeholder="Maker name"
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  value={makerForm.address}
                  onChange={(e) => setMakerForm({ ...makerForm, address: e.target.value })}
                  placeholder="Address"
                  required
                  className="input-field"
                />
                <input
                  type="text"
                  value={makerForm.postcode}
                  onChange={(e) => setMakerForm({ ...makerForm, postcode: e.target.value })}
                  placeholder="Postcode"
                  required
                  className="input-field"
                />
                <p className="text-anddine-muted text-xs">
                  Coordinates are looked up automatically from the address.
                </p>
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-anddine-text mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {MAKER_TAGS.map((tag) => {
                      const selected = makerForm.tags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setMakerForm({
                            ...makerForm,
                            tags: selected
                              ? makerForm.tags.filter((t) => t !== tag)
                              : [...makerForm.tags, tag],
                          })}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                            selected
                              ? "bg-anddine-pink text-white"
                              : "bg-anddine-bg border border-anddine-border text-anddine-muted hover:text-anddine-text"
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1">
                    {editingMaker ? "Save Changes" : "Add Maker"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowMakerForm(false); setEditingMaker(null) }}
                    className="flex-1 py-2 rounded-xl border border-anddine-border text-anddine-text hover:bg-anddine-bg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && <p className="text-anddine-muted text-sm">Loading...</p>}

        <div className="space-y-3">
          {makers.filter((m) => {
            if (!search.trim()) return true
            const q = search.toLowerCase()
            return m.name.toLowerCase().includes(q) || m.address.toLowerCase().includes(q) || m.postcode.toLowerCase().includes(q)
          }).map((maker) => {
            const makerImage = getMakerImage(maker.name, maker.image_url)
            const brand = getMakerBrand(maker.name)
            return (
            <div key={maker.id} className={`rounded-2xl overflow-hidden border border-anddine-border ${makerImage ? "relative" : "card"}`}>
              {makerImage && (
                <>
                  <Image src={makerImage} alt={brand} fill className="object-cover" sizes="(max-width: 672px) 100vw, 672px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                </>
              )}
              <div
                className={`relative z-10 cursor-pointer p-4 ${makerImage ? "" : ""}`}
                onClick={() => setExpandedMaker(expandedMaker === maker.id ? null : maker.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold ${makerImage ? "text-white" : "text-anddine-text"}`}>{brand}</h3>
                    <p className={`text-sm ${makerImage ? "text-white/80" : "text-anddine-muted"}`}>{maker.address}, {maker.postcode}</p>
                    <p className={`text-xs mt-0.5 ${makerImage ? "text-white/60" : "text-anddine-muted"}`}>
                      {maker.offers.filter((o) => o.active).length} active offer{maker.offers.filter((o) => o.active).length !== 1 ? "s" : ""}
                      {maker.latitude && maker.longitude && " · GPS set"}
                      {maker.nfc_token && " · NFC set"}
                    </p>
                    {maker.tags && maker.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {maker.tags.map((tag) => (
                          <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full ${makerImage ? "bg-white/20 text-white/80" : "bg-anddine-pink/10 text-anddine-pink"}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${makerImage ? "text-white/70" : "text-anddine-muted"} ${expandedMaker === maker.id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expandedMaker === maker.id && (
                <div className={`relative z-10 mt-4 pt-4 border-t px-4 pb-4 ${makerImage ? "border-white/20" : "border-anddine-border"}`}>
                  {/* Image upload */}
                  <div className={`mb-4 py-2 px-3 rounded-xl ${makerImage ? "bg-black/40 backdrop-blur-sm" : "bg-anddine-bg"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium ${makerImage ? "text-white/70" : "text-anddine-muted"}`}>Maker Image</span>
                      <div className="flex items-center gap-2">
                        <label className={`text-xs cursor-pointer hover:underline ${makerImage ? "text-white" : "text-anddine-pink"}`}>
                          {uploadingImage === maker.id ? "Uploading..." : (maker.image_url ? "Replace" : "Upload")}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingImage === maker.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) uploadImage(maker.id, file)
                              e.target.value = ""
                            }}
                          />
                        </label>
                        {maker.image_url && (
                          <button
                            onClick={() => removeImage(maker.id)}
                            className={`text-xs hover:underline ${makerImage ? "text-red-300" : "text-red-500"}`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {maker.image_url && (
                      <p className={`text-xs truncate ${makerImage ? "text-white/50" : "text-anddine-muted"}`}>
                        Uploaded image active
                      </p>
                    )}
                    {!maker.image_url && makerImage && (
                      <p className={`text-xs ${makerImage ? "text-white/50" : "text-anddine-muted"}`}>
                        Using default image
                      </p>
                    )}
                    {!maker.image_url && !makerImage && (
                      <p className="text-xs text-anddine-muted">
                        No image set
                      </p>
                    )}
                  </div>

                  {/* Maker ID */}
                  <div className={`flex items-center gap-2 mb-4 py-2 px-3 rounded-xl ${makerImage ? "bg-black/40 backdrop-blur-sm" : "bg-anddine-bg"}`}>
                    <span className={`text-xs ${makerImage ? "text-white/70" : "text-anddine-muted"}`}>Maker ID:</span>
                    <code className={`text-xs font-mono truncate ${makerImage ? "text-white" : "text-anddine-text"}`}>{maker.id}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(maker.id)
                        alert("Maker ID copied!")
                      }}
                      className={`text-xs hover:underline ml-auto shrink-0 ${makerImage ? "text-white/70 hover:text-white" : "text-anddine-pink"}`}
                    >
                      Copy
                    </button>
                  </div>

                  {/* NFC token */}
                  <div className={`flex items-center gap-2 mb-4 py-2 px-3 rounded-xl ${makerImage ? "bg-black/40 backdrop-blur-sm" : "bg-anddine-bg"}`}>
                    <span className={`text-xs ${makerImage ? "text-white/70" : "text-anddine-muted"}`}>NFC Token:</span>
                    <code className={`text-xs font-mono truncate ${makerImage ? "text-white" : "text-anddine-text"}`}>{maker.nfc_token || "Not set"}</code>
                    <div className="flex items-center gap-2 ml-auto shrink-0">
                      {maker.nfc_token && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(maker.nfc_token!)
                            alert("NFC Token copied!")
                          }}
                          className={`text-xs hover:underline ${makerImage ? "text-white/70 hover:text-white" : "text-anddine-pink"}`}
                        >
                          Copy
                        </button>
                      )}
                      <button
                        onClick={() => regenerateNfc(maker.id, maker.nfc_token)}
                        className="text-xs text-red-400 hover:text-red-600 hover:underline"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>

                  {/* Maker actions */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => startEditMaker(maker)}
                      className={`text-sm hover:underline ${makerImage ? "text-white" : "text-anddine-pink"}`}
                    >
                      Edit Maker Details
                    </button>
                    <span className={makerImage ? "text-white/50" : "text-anddine-muted"}>·</span>
                    <button
                      onClick={() => deleteMaker(maker.id)}
                      className={`text-sm hover:underline ${makerImage ? "text-red-300" : "text-red-500"}`}
                    >
                      Delete maker
                    </button>
                  </div>

                  {/* Offers */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${makerImage ? "text-white" : "text-anddine-text"}`}>Offers</h4>
                      <button
                        onClick={() => {
                          setAddingOfferFor(maker.id)
                          setOfferForm({ title: "", description: "", offer_type: "free_item", estimated_value: "" })
                        }}
                        className={`text-sm hover:underline ${makerImage ? "text-white" : "text-anddine-pink"}`}
                      >
                        + Add offer
                      </button>
                    </div>

                    {maker.offers.length === 0 && (
                      <p className={`text-sm ${makerImage ? "text-white/60" : "text-anddine-muted"}`}>No offers yet.</p>
                    )}

                    {maker.offers.map((offer) => (
                      editingOffer?.id === offer.id ? (
                        <form key={offer.id} onSubmit={updateOffer} className={`space-y-2 py-2 px-3 rounded-xl ${makerImage ? "bg-black/40 backdrop-blur-sm" : "bg-anddine-bg"}`}>
                          <input
                            type="text"
                            value={editOfferForm.title}
                            onChange={(e) => setEditOfferForm({ ...editOfferForm, title: e.target.value })}
                            placeholder="Offer title"
                            required
                            className="input-field text-sm"
                          />
                          <input
                            type="text"
                            value={editOfferForm.description}
                            onChange={(e) => setEditOfferForm({ ...editOfferForm, description: e.target.value })}
                            placeholder="Description (optional)"
                            className="input-field text-sm"
                          />
                          <select
                            value={editOfferForm.offer_type}
                            onChange={(e) => setEditOfferForm({ ...editOfferForm, offer_type: e.target.value as OfferType })}
                            className="input-field text-sm"
                          >
                            <option value="free_item">Free item</option>
                            <option value="discount">Discount</option>
                            <option value="upgrade">Upgrade</option>
                            <option value="special">Special</option>
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editOfferForm.estimated_value}
                            onChange={(e) => setEditOfferForm({ ...editOfferForm, estimated_value: e.target.value })}
                            placeholder="Savings value in £ (e.g. 3.50)"
                            className="input-field text-sm"
                          />
                          <div className="flex gap-2">
                            <button type="submit" className="btn-primary text-sm px-4 py-2">Save</button>
                            <button type="button" onClick={() => setEditingOffer(null)} className="text-sm text-anddine-muted hover:underline">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div key={offer.id} className={`flex items-center justify-between py-2 px-3 rounded-xl ${makerImage ? "bg-black/40 backdrop-blur-sm" : "bg-anddine-bg"}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${makerImage ? (offer.active ? "text-white" : "text-white/40 line-through") : (offer.active ? "text-anddine-text" : "text-anddine-muted line-through")}`}>
                                {offer.title}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full border ${makerImage ? "bg-white/20 border-white/30 text-white/80" : "bg-white border-anddine-border text-anddine-muted"}`}>
                                {offer.offer_type.replace("_", " ")}
                              </span>
                            </div>
                            {offer.description && (
                              <p className={`text-xs mt-0.5 ${makerImage ? "text-white/60" : "text-anddine-muted"}`}>{offer.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => startEditOffer(offer)}
                              className={makerImage ? "text-white hover:text-white/80" : "text-anddine-pink hover:text-anddine-pink/80"}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => toggleOffer(offer)}
                              className={`text-xs px-2 py-1 rounded-lg ${offer.active ? (makerImage ? "bg-green-500/30 text-green-300" : "bg-green-100 text-green-700") : (makerImage ? "bg-white/10 text-white/50" : "bg-gray-100 text-gray-500")}`}
                            >
                              {offer.active ? "Active" : "Inactive"}
                            </button>
                            <button
                              onClick={() => deleteOffer(offer.id)}
                              className={makerImage ? "text-red-300 hover:text-red-200" : "text-red-400 hover:text-red-600"}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )
                    ))}

                    {/* Add offer form */}
                    {addingOfferFor === maker.id && (
                      <form onSubmit={(e) => saveOffer(e, maker.id)} className="space-y-2 pt-2">
                        <input
                          type="text"
                          value={offerForm.title}
                          onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                          placeholder="Offer title (e.g. Free cookie with any coffee)"
                          required
                          className="input-field text-sm"
                        />
                        <input
                          type="text"
                          value={offerForm.description}
                          onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                          placeholder="Description (optional)"
                          className="input-field text-sm"
                        />
                        <select
                          value={offerForm.offer_type}
                          onChange={(e) => setOfferForm({ ...offerForm, offer_type: e.target.value as OfferType })}
                          className="input-field text-sm"
                        >
                          <option value="free_item">Free item</option>
                          <option value="discount">Discount</option>
                          <option value="upgrade">Upgrade</option>
                          <option value="special">Special</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={offerForm.estimated_value}
                          onChange={(e) => setOfferForm({ ...offerForm, estimated_value: e.target.value })}
                          placeholder="Savings value in £ (e.g. 3.50)"
                          className="input-field text-sm"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="btn-primary text-sm px-4 py-2">
                            Add offer
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingOfferFor(null)}
                            className="text-sm text-anddine-muted hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </div>

        {!loading && makers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-anddine-muted">No Makers yet. Add your first one.</p>
          </div>
        )}
        </>)}

        {activeTab === "orgs" && (<>
        {/* Organisations / Domains */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-medium">Organisations</h2>
              <p className="text-anddine-muted text-xs mt-0.5">Manage which email domains are part of &amp;Dine Express</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const headers = ["name", "allowed_domain", "location", "id", "slug"]
                  const rows = orgs.map((o) => [
                    o.name, o.allowed_domain, o.location, o.id, o.slug,
                  ].map((v) => v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v).join(","))
                  const csv = [headers.join(","), ...rows].join("\n")
                  const blob = new Blob([csv], { type: "text/csv" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "organisations.csv"
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="text-sm px-4 py-2 rounded-xl border border-anddine-border text-anddine-text hover:bg-anddine-bg"
              >
                Export CSV
              </button>
              <button
                onClick={() => {
                  setOrgForm({ name: "", allowed_domain: "", location: "" })
                  setShowOrgForm(true)
                }}
                className="btn-primary text-sm px-4 py-2"
              >
                + Add Organisation
              </button>
            </div>
          </div>

          {/* Add org form */}
          {showOrgForm && (
            <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-lg font-medium mb-4">Add Organisation</h2>
                <form onSubmit={addOrg} className="space-y-3">
                  <input
                    type="text"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    placeholder="Organisation name (e.g. Acme Corp)"
                    required
                    className="input-field"
                  />
                  <div>
                    <input
                      type="text"
                      value={orgForm.allowed_domain}
                      onChange={(e) => setOrgForm({ ...orgForm, allowed_domain: e.target.value })}
                      placeholder="Email domain (e.g. acme.com)"
                      required
                      className="input-field"
                    />
                    <p className="text-anddine-muted text-xs mt-1">
                      Users with @{orgForm.allowed_domain || "domain"} emails will be able to sign up
                    </p>
                  </div>
                  <input
                    type="text"
                    value={orgForm.location}
                    onChange={(e) => setOrgForm({ ...orgForm, location: e.target.value })}
                    placeholder="Office location (e.g. Oxford St, W1)"
                    className="input-field"
                  />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary flex-1">
                      Add Organisation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOrgForm(false)}
                      className="flex-1 py-2 rounded-xl border border-anddine-border text-anddine-text hover:bg-anddine-bg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {orgs.map((org) => (
              <div key={org.id} className="card flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-anddine-text">{org.name}</h3>
                  <p className="text-sm text-anddine-pink font-medium">@{org.allowed_domain}</p>
                  {org.location && (
                    <p className="text-xs text-anddine-muted mt-0.5">{org.location}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resetOrgRedemptions(org.id, org.name)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-anddine-pink/10 text-anddine-pink hover:bg-anddine-pink/20 transition-colors"
                  >
                    Reset Offer Allowance
                  </button>
                  <button
                    onClick={() => deleteOrg(org.id, org.name)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {orgs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-anddine-muted">No organisations yet.</p>
            </div>
          )}
        </div>
        </>)}

        {activeTab === "metrics" && (<>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-medium">Metrics</h2>
              <p className="text-anddine-muted text-xs mt-0.5">Manage &amp;Dine Express metrics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMetricsCache({})
                  const activeRanges = new Set(Object.values(cardRanges))
                  activeRanges.forEach((r) => fetchMetricsForRange(r))
                }}
                className="text-sm px-4 py-2 rounded-xl border border-anddine-border text-anddine-text hover:bg-anddine-bg transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleCsvExport}
                className="btn-primary text-sm px-4 py-2"
              >
                Export XLSX
              </button>
            </div>
          </div>

          {metricsLoading && !metricsCache.all && (
            <div className="text-center py-12">
              <p className="text-anddine-muted">Loading metrics...</p>
            </div>
          )}

          {metricsCache.all && (() => {
            const rangeOptions: { value: MetricRange; label: string }[] = [
              { value: "day", label: "Today" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
              { value: "all", label: "All time" },
            ]

            function RangePicker({ card }: { card: string }) {
              const currentLabel = rangeOptions.find((o) => o.value === cardRanges[card])?.label || "All time"
              const [open, setOpen] = useState(false)
              return (
                <div className="relative inline-block">
                  <button
                    onClick={() => setOpen(!open)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-anddine-pink hover:text-anddine-pink/80 transition-colors"
                  >
                    {currentLabel}
                    <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {open && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-anddine-border z-20 py-1 min-w-[100px]">
                      {rangeOptions.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => {
                            setCardRanges((prev) => ({ ...prev, [card]: o.value }))
                            if (!metricsCache[o.value]) fetchMetricsForRange(o.value)
                            setOpen(false)
                          }}
                          className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                            cardRanges[card] === o.value
                              ? "text-anddine-pink font-semibold"
                              : "text-anddine-text hover:bg-anddine-bg"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            const getM = (card: string) => metricsCache[cardRanges[card]] || metricsCache.all!

            return (
            <div className="space-y-4">
              {/* Total */}
              <div className="card">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-anddine-text">Total Redemptions</h3>
                  <RangePicker card="total" />
                </div>
                <p className="text-3xl font-semibold text-anddine-text">{getM("total").totalRedemptions}</p>
              </div>

              {/* Most Popular Offers */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-anddine-text">Most Popular Offers</h3>
                  <RangePicker card="offers" />
                </div>
                {getM("offers").topOffers.length === 0 && <p className="text-anddine-muted text-sm">No data yet</p>}
                {getM("offers").topOffers.map((item, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="text-anddine-text truncate mr-2">{item.title}</span>
                      <span className="text-anddine-muted shrink-0">{item.count}</span>
                    </div>
                    <div className="w-full bg-anddine-bg rounded-full h-2">
                      <div
                        className="bg-anddine-pink h-2 rounded-full transition-all"
                        style={{ width: `${(item.count / getM("offers").topOffers[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Most Popular Makers */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-anddine-text">Most Popular Makers</h3>
                  <RangePicker card="makers" />
                </div>
                {getM("makers").topMakers.length === 0 && <p className="text-anddine-muted text-sm">No data yet</p>}
                {getM("makers").topMakers.map((item, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="text-anddine-text truncate mr-2">{item.name}</span>
                      <span className="text-anddine-muted shrink-0">{item.count}</span>
                    </div>
                    <div className="w-full bg-anddine-bg rounded-full h-2">
                      <div
                        className="bg-anddine-pink h-2 rounded-full transition-all"
                        style={{ width: `${(item.count / getM("makers").topMakers[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Organisations by Savings */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-anddine-text">Savings by Organisation</h3>
                  <RangePicker card="savings" />
                </div>
                {getM("savings").topOrgs.length === 0 && <p className="text-anddine-muted text-sm">No data yet</p>}
                {getM("savings").topOrgs.map((item, i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="text-anddine-text truncate mr-2">{item.name}</span>
                      <span className="text-anddine-muted shrink-0">£{item.savings.toFixed(2)} · {item.count} uses</span>
                    </div>
                    <div className="w-full bg-anddine-bg rounded-full h-2">
                      <div
                        className="bg-anddine-pink h-2 rounded-full transition-all"
                        style={{ width: `${(item.savings / getM("savings").topOrgs[0].savings) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Popular Makers by Organisation */}
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-anddine-text">Popular Makers by Organisation</h3>
                  <RangePicker card="makersByOrg" />
                </div>
                {getM("makersByOrg").makersByOrg.length === 0 && <p className="text-anddine-muted text-sm">No data yet</p>}
                {getM("makersByOrg").makersByOrg.map((org) => (
                  <div key={org.organisation_id} className="mb-2">
                    <button
                      className="flex items-center justify-between w-full py-2 text-left"
                      onClick={() => setExpandedOrg(expandedOrg === org.organisation_id ? null : org.organisation_id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-anddine-text font-medium">{org.organisation_name}</span>
                        <span className="text-xs text-anddine-muted">{org.total_redemptions} redemptions</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform text-anddine-muted ${expandedOrg === org.organisation_id ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedOrg === org.organisation_id && (
                      <div className="pl-2 pb-2 space-y-1.5">
                        {org.topMakers.map((maker) => (
                          <div key={maker.maker_id}>
                            <div className="flex justify-between text-sm mb-0.5">
                              <span className="text-anddine-text truncate mr-2">{maker.name}</span>
                              <span className="text-anddine-muted shrink-0">{maker.count}</span>
                            </div>
                            <div className="w-full bg-anddine-bg rounded-full h-2">
                              <div
                                className="bg-anddine-pink h-2 rounded-full transition-all"
                                style={{ width: `${(maker.count / org.topMakers[0].count) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {getM("total").totalRedemptions === 0 && cardRanges.total === "all" && (
                <div className="text-center py-8">
                  <p className="text-anddine-muted">No redemptions recorded yet. Metrics will appear once users start redeeming offers.</p>
                </div>
              )}
            </div>
            )
          })()}
        </div>
        </>)}
      </main>
    </div>
  )
}

// moved date filters for metrics dashboard here - HTk