"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/db"
import { hashPassword, verifyPassword, generateSalt } from "@/lib/auth-utils"
import { authenticator } from "otplib"
import QRCode from "qrcode"
import { getServerSession as getNextAuthSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Types
export type User = {
  id: string
  name: string
  email: string
  image?: string
  role?: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  theme?: string
  language?: string
  country?: string
  twoFactorEnabled?: boolean
  isPremium?: boolean
  premiumExpiresAt?: string
  premiumType?: string
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    // First, check for custom session cookies (email/password auth)
    const cookieStore = await cookies()
    const userId = cookieStore.get("user-id")?.value

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user) {
        return {
          id: user.id,
          name: user.name || "",
          email: user.email,
          image: user.image || undefined,
          role: user.role,
          emailNotifications: user.emailNotifications,
          pushNotifications: user.pushNotifications,
          theme: user.theme,
          language: user.language,
          country: user.country || undefined,
          twoFactorEnabled: user.twoFactorEnabled,
          isPremium: user.isPremium,
          premiumExpiresAt: user.premiumExpiresAt?.toISOString(),
          premiumType: user.premiumType || undefined,
        }
      }
    }

    // If no custom session, check for NextAuth session (OAuth)
    // Wrap in try-catch to handle JWT decryption errors gracefully
    try {
      const nextAuthSession = await getNextAuthSession(authOptions)
      
      if (nextAuthSession?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: nextAuthSession.user.email },
        })

        if (user) {
          return {
            id: user.id,
            name: user.name || "",
            email: user.email,
            image: user.image || undefined,
            role: user.role,
            emailNotifications: user.emailNotifications,
            pushNotifications: user.pushNotifications,
            theme: user.theme,
            language: user.language,
                       country: user.country || undefined,
           twoFactorEnabled: user.twoFactorEnabled,
           isPremium: user.isPremium,
           premiumExpiresAt: user.premiumExpiresAt?.toISOString(),
           premiumType: user.premiumType || undefined,
          }
        }
      }
    } catch (jwtError: any) {
      // Log JWT errors but don't throw - this handles corrupted JWT tokens gracefully
      console.warn("JWT session error (likely corrupted token):", jwtError.message)
      // Continue execution - user will be treated as not authenticated
    }

    return null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Login function using Prisma
export async function login(email: string, password: string) {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, message: "Email and password are required" }
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.passwordHash || !user.passwordSalt) {
      return { success: false, message: "Invalid email or password" }
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.passwordHash, user.passwordSalt)
    if (!isValidPassword) {
      return { success: false, message: "Invalid email or password" }
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Return success but indicate 2FA verification is needed
      return {
        success: true,
        requiresTwoFactor: true,
        tempUserId: user.id, // Temporary user ID for 2FA verification
        message: "Please enter your two-factor authentication code"
      }
    }

    // Complete login if 2FA is not enabled
    return await completeLogin(user)
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

// Helper function to complete login (extracted for reuse)
async function completeLogin(user: any) {
  // Generate session token
  const sessionToken = uuidv4()

  // Set cookies
  const cookieStore = await cookies()
  cookieStore.set("session-token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  cookieStore.set("user-id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  // Return success
  return {
    success: true,
    user: {
      id: user.id,
      name: user.name || "",
      email: user.email,
      image: user.image || undefined,
      role: user.role,
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      theme: user.theme,
      language: user.language,
      twoFactorEnabled: user.twoFactorEnabled,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      premiumType: user.premiumType,
    },
  }
}

// Signup function using Prisma
export async function signup(name: string, email: string, password: string) {
  try {
    // Validate input
    if (!name || !email || !password) {
      return { success: false, message: "Name, email, and password are required" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, message: "Invalid email address" }
    }

    // Validate password strength
    if (password.length < 8) {
      return { success: false, message: "Password must be at least 8 characters long" }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, message: "Email already in use" }
    }

    // Hash password
    const salt = generateSalt()
    const hashedPassword = hashPassword(password, salt)

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name,
        email,
        passwordHash: hashedPassword,
        passwordSalt: salt,
        role: "user",
        emailNotifications: true,
        pushNotifications: true,
        theme: "system",
        language: "English",
        country: "United States",
      },
    })

    // Generate session token
    const sessionToken = uuidv4()

    // Set cookies
    const cookieStore = await cookies()
    cookieStore.set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    cookieStore.set("user-id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return success
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: user.role,
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        theme: user.theme,
        language: user.language,
        twoFactorEnabled: false,
        isPremium: false,
        premiumExpiresAt: null,
        premiumType: null,
      },
    }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, message: "An error occurred during signup" }
  }
}

// Logout function
export async function logout() {
  try {
    // Delete cookies
    const cookieStore = await cookies()
    cookieStore.delete("session-token")
    cookieStore.delete("user-id")

    // Redirect to home page
    redirect("/")
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

// Check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "admin"
}

// Require authentication middleware
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

// Require admin middleware
export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    redirect("/login")
  }
  return user
}

// API-safe version of requireAdmin that doesn't redirect
export async function requireAdminAPI() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") {
    return null
  }
  return user
}

// For backward compatibility
export async function getServerSession() {
  const user = await getCurrentUser()
  if (!user) return null

  return {
    user,
  }
}

// Update user preferences
export async function updateUserPreferences(
  userId: string,
  preferences: {
    emailNotifications?: boolean
    pushNotifications?: boolean
    theme?: string
    language?: string
    country?: string
  }
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        theme: preferences.theme,
        language: preferences.language,
        country: preferences.country,
        updatedAt: new Date(),
      },
    })

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name || "",
        email: updatedUser.email,
        image: updatedUser.image || undefined,
        role: updatedUser.role,
        emailNotifications: updatedUser.emailNotifications,
        pushNotifications: updatedUser.pushNotifications,
        theme: updatedUser.theme,
        language: updatedUser.language,
        country: updatedUser.country,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        isPremium: updatedUser.isPremium,
        premiumExpiresAt: updatedUser.premiumExpiresAt,
        premiumType: updatedUser.premiumType,
      },
    }
  } catch (error) {
    console.error("Update preferences error:", error)
    return { success: false, message: "An error occurred while updating preferences" }
  }
}

// Change password
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  try {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.passwordHash || !user.passwordSalt) {
      return { success: false, message: "User not found" }
    }

    // Verify current password
    const isValidPassword = verifyPassword(currentPassword, user.passwordHash, user.passwordSalt)
    if (!isValidPassword) {
      return { success: false, message: "Current password is incorrect" }
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return { success: false, message: "New password must be at least 8 characters long" }
    }

    // Hash new password
    const salt = generateSalt()
    const hashedPassword = hashPassword(newPassword, salt)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        passwordSalt: salt,
        updatedAt: new Date(),
      },
    })

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Change password error:", error)
    return { success: false, message: "An error occurred while changing password" }
  }
}

// Generate 2FA setup
export async function generate2FASetup(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, message: "User not found" }
    }

    // Generate secret
    const secret = authenticator.generateSecret()
    
    // Create service name and account name for QR code
    const serviceName = "Turify"
    const accountName = user.email
    
    // Generate otpauth URL
    const otpauthUrl = authenticator.keyuri(accountName, serviceName, secret)
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauthUrl)
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    )

    return {
      success: true,
      secret,
      qrCode,
      backupCodes,
      otpauthUrl,
    }
  } catch (error) {
    console.error("Generate 2FA setup error:", error)
    return { success: false, message: "An error occurred while generating 2FA setup" }
  }
}

// Enable 2FA
export async function enable2FA(
  userId: string,
  secret: string,
  token: string,
  backupCodes: string[]
) {
  try {
    // Verify the token
    const isValid = authenticator.verify({ token, secret })
    
    if (!isValid) {
      return { success: false, message: "Invalid verification code" }
    }

    // Update user with 2FA settings
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes,
        updatedAt: new Date(),
      },
    })

    return { success: true, message: "Two-factor authentication enabled successfully" }
  } catch (error) {
    console.error("Enable 2FA error:", error)
    return { success: false, message: "An error occurred while enabling 2FA" }
  }
}

// Disable 2FA
export async function disable2FA(userId: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.passwordHash || !user.passwordSalt) {
      return { success: false, message: "User not found" }
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.passwordHash, user.passwordSalt)
    if (!isValidPassword) {
      return { success: false, message: "Password is incorrect" }
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
        updatedAt: new Date(),
      },
    })

    return { success: true, message: "Two-factor authentication disabled successfully" }
  } catch (error) {
    console.error("Disable 2FA error:", error)
    return { success: false, message: "An error occurred while disabling 2FA" }
  }
}

// Verify 2FA during login
export async function verifyLoginTwoFactor(tempUserId: string, token: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: tempUserId },
    })

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return { success: false, message: "Two-factor authentication not enabled for this user" }
    }

    // Verify the token
    const isValid = authenticator.verify({ 
      token, 
      secret: user.twoFactorSecret 
    })

    if (!isValid) {
      // Check if it's a backup code
      if (user.backupCodes.includes(token.toUpperCase())) {
        // Remove the used backup code
        const updatedBackupCodes = user.backupCodes.filter((code: string) => code !== token.toUpperCase())
        await prisma.user.update({
          where: { id: tempUserId },
          data: { backupCodes: updatedBackupCodes }
        })
      } else {
        return { success: false, message: "Invalid verification code" }
      }
    }

    // Complete the login process
    return await completeLogin(user)
  } catch (error) {
    console.error("Verify login 2FA error:", error)
    return { success: false, message: "An error occurred while verifying two-factor authentication" }
  }
}
