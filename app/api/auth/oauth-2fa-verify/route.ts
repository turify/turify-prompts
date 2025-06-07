import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { authenticator } from "otplib"
import { getCurrentUser } from "@/app/actions/auth-actions"

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" }, 
        { status: 400 }
      )
    }

    // Verify the session
    const user = await getCurrentUser()
    if (!user || user.email !== email) {
      return NextResponse.json(
        { success: false, message: "Invalid session" }, 
        { status: 401 }
      )
    }

    // Find the user in database
    const dbUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!dbUser || !dbUser.twoFactorEnabled || !dbUser.twoFactorSecret) {
      return NextResponse.json(
        { success: false, message: "Two-factor authentication not enabled for this user" }, 
        { status: 400 }
      )
    }

    // Verify the token
    const isValid = authenticator.verify({ 
      token, 
      secret: dbUser.twoFactorSecret 
    })

    if (!isValid) {
      // Check if it's a backup code
      if (dbUser.backupCodes.includes(token.toUpperCase())) {
        // Remove the used backup code
        const updatedBackupCodes = dbUser.backupCodes.filter((code: string) => code !== token.toUpperCase())
        await prisma.user.update({
          where: { email },
          data: { backupCodes: updatedBackupCodes }
        })
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid verification code" }, 
          { status: 400 }
        )
      }
    }

    // 2FA verification successful
    await prisma.user.update({
      where: { email },
      data: {
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "2FA verification successful"
    })
  } catch (error) {
    console.error("OAuth 2FA verification error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during verification" }, 
      { status: 500 }
    )
  }
} 