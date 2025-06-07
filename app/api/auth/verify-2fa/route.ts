import { NextResponse } from "next/server"
import { verifyLoginTwoFactor } from "@/app/actions/auth-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tempUserId, token } = body

    if (!tempUserId || !token) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" }, 
        { status: 400 }
      )
    }

    const result = await verifyLoginTwoFactor(tempUserId, token)
    return NextResponse.json(result)
  } catch (error) {
    console.error("2FA verification API error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during 2FA verification" }, 
      { status: 500 }
    )
  }
} 