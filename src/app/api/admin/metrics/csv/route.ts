import { createAdminSupabaseClient } from "@/lib/supabase/admin"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import * as XLSX from "xlsx"

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

  // Sheet 1: Raw redemptions
  const rawRows = (redemptions || []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    offer_title: (r.offers as any)?.title || "",
    offer_type: (r.offers as any)?.offer_type || "",
    maker_name: (r.makers as any)?.name || "",
    organisation_name: (r.organisations as any)?.name || "",
    redeemed_at: r.redeemed_at,
  }))

  // Sheet 2: Maker popularity by organisation
  const summaryMap = new Map<string, { org: string; maker: string; count: number }>()
  for (const r of redemptions || []) {
    const orgName = (r.organisations as any)?.name || "Unknown"
    const makerName = (r.makers as any)?.name || "Unknown"
    const key = `${orgName}|||${makerName}`
    const existing = summaryMap.get(key)
    if (existing) {
      existing.count++
    } else {
      summaryMap.set(key, { org: orgName, maker: makerName, count: 1 })
    }
  }

  const summaryRows = Array.from(summaryMap.values())
    .sort((a, b) => {
      const orgCmp = a.org.localeCompare(b.org)
      return orgCmp !== 0 ? orgCmp : b.count - a.count
    })
    .map((row) => ({
      organisation_name: row.org,
      maker_name: row.maker,
      redemption_count: row.count,
    }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rawRows), "Redemptions")
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), "Maker Summary")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=anddine_metrics.xlsx",
    },
  })
}
