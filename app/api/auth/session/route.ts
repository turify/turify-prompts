import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/actions/auth-actions"

export async function GET() {
  try {
    // Get user from our authentication system
    const user = await getCurrentUser()
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Session API error:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
