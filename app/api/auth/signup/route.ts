import { NextResponse } from "next/server"
import { signup } from "@/app/actions/auth-actions"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    const result = await signup(name, email, password)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Signup API error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during signup" }, { status: 500 })
  }
}
