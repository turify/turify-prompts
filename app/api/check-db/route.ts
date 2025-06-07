import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  const detailed = request.nextUrl.searchParams.get("detailed") === "true"

  try {
    // Test database connection by running a simple query
    await prisma.$queryRaw`SELECT 1 as connected`

    // Check if we can access the prompts table
    let tableExists = true
    let promptsCount = 0
    let error = null

    try {
      promptsCount = await prisma.prompt.count()
    } catch (e) {
      tableExists = false
      error = e instanceof Error ? e.message : String(e)
    }

    if (detailed) {
      // Get all table information using raw SQL for detailed diagnostics
      const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `

      return NextResponse.json({
        success: true,
        connected: true,
        tableExists,
        promptsCount,
        tables: tables.map((t: { table_name: string }) => t.table_name),
        error,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      connected: true,
      initialized: tableExists,
      message: tableExists ? "Database is ready" : "Database tables not found",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database check error:", error)
    return NextResponse.json(
      {
        success: false,
        connected: false,
        initialized: false,
        error: error instanceof Error ? error.message : "Unknown database error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
