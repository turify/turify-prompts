import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/actions/auth-actions"
import { trackPageView } from "@/lib/analytics-service"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    const userId = user?.id

    const { path, referrer } = await request.json()

    if (!path) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await trackPageView(userId, path)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking page view:", error)
    return NextResponse.json({ error: "Failed to track page view" }, { status: 500 })
  }
}
