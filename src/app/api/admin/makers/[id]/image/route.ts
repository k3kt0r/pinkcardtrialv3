import { NextResponse } from "next/server"
import { verifyAdmin, unauthorizedResponse } from "@/lib/admin-auth"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

const BUCKET = "maker-images"

async function ensureBucket(supabase: ReturnType<typeof createAdminSupabaseClient>) {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const makerId = params.id

  // Verify maker exists
  const { data: maker } = await supabase
    .from("makers")
    .select("id, name")
    .eq("id", makerId)
    .single()

  if (!maker) {
    return NextResponse.json({ error: "Maker not found" }, { status: 404 })
  }

  const formData = await request.formData()
  const file = formData.get("image") as File | null

  if (!file) {
    return NextResponse.json({ error: "No image file provided" }, { status: 400 })
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 })
  }

  // Ensure bucket exists
  await ensureBucket(supabase)

  // Upload to Supabase Storage
  const ext = file.name.split(".").pop() || "png"
  const filePath = `${makerId}.${ext}`

  // Remove old image if it exists (different extension)
  const { data: existing } = await supabase.storage.from(BUCKET).list("", {
    search: makerId,
  })
  if (existing) {
    const oldFiles = existing.filter((f) => f.name.startsWith(makerId))
    for (const old of oldFiles) {
      await supabase.storage.from(BUCKET).remove([old.name])
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  const imageUrl = urlData.publicUrl

  // Update maker record
  const { error: updateError } = await supabase
    .from("makers")
    .update({ image_url: imageUrl })
    .eq("id", makerId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ image_url: imageUrl })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!verifyAdmin(request)) return unauthorizedResponse()

  const supabase = createAdminSupabaseClient()
  const makerId = params.id

  // Remove from storage
  const { data: existing } = await supabase.storage.from(BUCKET).list("", {
    search: makerId,
  })
  if (existing) {
    const files = existing.filter((f) => f.name.startsWith(makerId))
    if (files.length > 0) {
      await supabase.storage.from(BUCKET).remove(files.map((f) => f.name))
    }
  }

  // Clear image_url on maker
  await supabase
    .from("makers")
    .update({ image_url: null })
    .eq("id", makerId)

  return NextResponse.json({ success: true })
}
