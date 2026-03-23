import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"

export async function GET(request: Request) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()

  const { data: redemptions, error } = await supabase
    .from("redemptions")
    .select("id, user_id, offer_id, maker_id, organisation_id, redeemed_at, offers(title, offer_type), makers(name), organisations(name)")
    .order("redeemed_at", { ascending: false })

  if (error) {
    return new Response("Failed to fetch redemptions", { status: 500 })
  }

  const rows = (redemptions || []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    offer_title: (r.offers as any)?.title || "",
    offer_type: (r.offers as any)?.offer_type || "",
    maker_name: (r.makers as any)?.name || "",
    organisation_name: (r.organisations as any)?.name || "",
    redeemed_at: r.redeemed_at,
  }))

  const headers = ["id", "user_id", "offer_title", "offer_type", "maker_name", "organisation_name", "redeemed_at"]
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = String((row as any)[h] || "")
        return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
      }).join(",")
    ),
  ]

  return new Response(csvLines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=redemptions.csv",
    },
  })
}
