import { NextResponse } from "next/server"
import { isAdmin } from "@/app/actions/auth-actions"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Check if user is admin
    const admin = await isAdmin()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all users (without sensitive data)
    const users = await sql`
      SELECT id, name, email, role, created_at FROM users
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
