import { NextRequest, NextResponse } from "next/server"
import { getPromptProcessingStatus } from "@/app/actions/prompt-actions"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await getPromptProcessingStatus(id)
    
    // Add cache control headers to prevent caching
    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error("Error fetching prompt status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch prompt status" },
      { status: 500 }
    )
  }
} 