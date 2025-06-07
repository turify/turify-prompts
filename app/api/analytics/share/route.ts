import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/actions/auth-actions"
import { trackShareEvent } from "@/lib/analytics-service"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    const userId = user?.id

    const { url, platform, title, promptId } = await request.json()

    if (!platform) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await trackShareEvent(promptId, platform, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking share event:", error)
    return NextResponse.json({ error: "Failed to track share event" }, { status: 500 })
  }
}
