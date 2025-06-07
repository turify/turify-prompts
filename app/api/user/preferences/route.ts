import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/actions/auth-actions"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferences: true }
    })

    const preferences = userData?.preferences || {}

    return NextResponse.json({ preferences })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { preferences } = await request.json()

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: "Invalid preferences data" },
        { status: 400 }
      )
    }

    // Update user preferences in database using Prisma ORM
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        preferences: preferences,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Preferences saved successfully" 
    })
  } catch (error) {
    console.error("Error saving user preferences:", error)
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    )
  }
} 