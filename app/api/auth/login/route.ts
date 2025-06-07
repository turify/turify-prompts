import { NextResponse } from "next/server"
import { login } from "@/app/actions/auth-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    const result = await login(email, password)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during login" }, { status: 500 })
  }
}
