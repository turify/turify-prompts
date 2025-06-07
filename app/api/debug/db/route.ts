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

    // Check database tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    return NextResponse.json({
      status: "ok",
      message: "Database tables retrieved successfully",
      tables: tables.map((t) => t.table_name),
    })
  } catch (error) {
    console.error("Database debug error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Database debug failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
