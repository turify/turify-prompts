import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/actions/auth-actions"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No active session" }, 
        { status: 401 }
      )
    }

    // This endpoint serves as a trigger to refresh the session
    return NextResponse.json({ 
      success: true, 
      message: "2FA flag cleared"
    })
  } catch (error) {
    console.error("Clear OAuth 2FA error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred" }, 
      { status: 500 }
    )
  }
} 