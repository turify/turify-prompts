import { NextResponse } from "next/server"
import { requireAdminAPI } from "@/app/actions/auth-actions"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Check if user is admin
    const admin = await requireAdminAPI()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all blog submissions with user information
    const submissions = await prisma.blogSubmission.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
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

export async function PATCH(request: Request) {
  try {
    // Check if user is admin
    const admin = await requireAdminAPI()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { submissionId, action, reviewNotes } = body

    // Validate required fields
    if (!submissionId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Invalid submission ID or action" },
        { status: 400 }
      )
    }

    // Get the submission
    const submission = await prisma.blogSubmission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    })

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      )
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: "Submission has already been reviewed" },
        { status: 400 }
      )
    }

    // Update submission status
    const updatedSubmission = await prisma.blogSubmission.update({
      where: { id: submissionId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
        reviewedBy: admin.id
      }
    })

    // If approved, grant premium membership
    if (action === 'approve') {
      const premiumExpiresAt = new Date()
      premiumExpiresAt.setMonth(premiumExpiresAt.getMonth() + 6) // 6 months from now

      await prisma.user.update({
        where: { id: submission.userId },
        data: {
          isPremium: true,
          premiumExpiresAt,
          premiumType: 'blog_promotion'
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      submission: updatedSubmission 
    })

  } catch (error) {
    console.error("Error processing blog submission:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 