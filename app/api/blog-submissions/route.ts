import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/actions/auth-actions"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { blogUrl, articleUrl, title, description } = body

    // Validate required fields
    if (!blogUrl || !articleUrl || !title) {
      return NextResponse.json(
        { error: "Blog URL, article URL, and title are required" },
        { status: 400 }
      )
    }

    // Validate URLs
    try {
      new URL(blogUrl)
      new URL(articleUrl)
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Check if user already has a pending or approved submission
    const existingSubmission = await prisma.blogSubmission.findFirst({
      where: {
        userId: user.id,
        status: {
          in: ["pending", "approved"]
        }
      }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: "You already have a pending or approved blog submission" },
        { status: 400 }
      )
    }

    // Create blog submission
    const submission = await prisma.blogSubmission.create({
      data: {
        userId: user.id,
        blogUrl,
        articleUrl,
        title,
        description: description || null,
        status: "pending"
      }
    })

    return NextResponse.json({ 
      success: true, 
      submission: {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt
      }
    })

  } catch (error) {
    console.error("Error creating blog submission:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's blog submissions
    const submissions = await prisma.blogSubmission.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    return NextResponse.json({ submissions })

  } catch (error) {
    console.error("Error fetching blog submissions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 