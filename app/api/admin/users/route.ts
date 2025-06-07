import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/app/actions/auth-actions"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Check if user is admin
    const user = await requireAdminAPI()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all users using Prisma
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
