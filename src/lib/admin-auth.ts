import { NextResponse } from "next/server"

export function verifyAdmin(request: Request): boolean {
  const authHeader = request.headers.get("authorization")
  return authHeader === process.env.ADMIN_PASSWORD
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
