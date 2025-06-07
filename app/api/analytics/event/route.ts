import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/actions/auth-actions"
import { trackCustomEvent } from "@/lib/analytics-service"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    const userId = user?.id

    const { eventName, properties } = await request.json()

    if (!eventName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await trackCustomEvent(eventName, properties, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking custom event:", error)
    return NextResponse.json({ error: "Failed to track custom event" }, { status: 500 })
  }
}
