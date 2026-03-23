import { getResend, FROM_EMAIL } from "@/lib/emails/resend"
import { welcomeEmail } from "@/lib/emails/templates"
import { NextResponse } from "next/server"
import { APP_URL } from "@/lib/constants"

export async function POST(request: Request) {
  const body = await request.json()
  const { email, name, orgName, makerCount } = body

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 })
  }

  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Your &Dine Express Card is ready",
      html: welcomeEmail({
        name: name || "",
        orgName: orgName || "your office",
        makerCount: makerCount || 0,
        browseUrl: `${APP_URL}/browse`,
      }),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
