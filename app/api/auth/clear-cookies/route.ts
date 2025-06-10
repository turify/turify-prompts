import { NextResponse } from "next/server"
import { clearAuthCookies } from "@/lib/clear-auth-cookies"

export async function GET() {
  try {
    const result = await clearAuthCookies()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error clearing auth cookies:", error)
    return NextResponse.json(
      { success: false, message: "Failed to clear cookies" }, 
      { status: 500 }
    )
  }
} 