import { NextRequest, NextResponse } from "next/server"
import { getFilteredPrompts } from "@/app/actions/prompt-actions"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Extract query parameters
    const page = Number(searchParams.get("page")) || 1
    const pageSize = Number(searchParams.get("pageSize")) || 10
    const industry = searchParams.get("industry") || undefined
    const minScore = searchParams.get("minScore") ? Number(searchParams.get("minScore")) : undefined
    const searchTerm = searchParams.get("searchTerm") || undefined

    // Call the server action to get filtered prompts
    const result = await getFilteredPrompts(page, pageSize, industry, minScore, searchTerm)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in /api/prompts:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
} 