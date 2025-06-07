// Re-export authentication functions from our new system
import { getCurrentUser, isAuthenticated, isAdmin, requireAuth, requireAdmin } from "@/app/actions/auth-actions"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "./auth-adapter"
import { prisma } from "./db"

// Export for backward compatibility
export { getCurrentUser, isAuthenticated, isAdmin, requireAuth, requireAdmin }

// Custom function to get server session (replaces next-auth getServerSession)
export async function getServerSession() {
  const user = await getCurrentUser()
  if (!user) return null

  return {
    user,
  }
}

// Add back the authOptions export for compatibility
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Let PrismaAdapter handle account linking automatically
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // Get user role from database for existing users
        if (account?.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })
          token.role = dbUser?.role || "user"
          token.twoFactorEnabled = dbUser?.twoFactorEnabled || false
          // Mark that this is a fresh OAuth login that needs 2FA verification if enabled
          if (dbUser?.twoFactorEnabled) {
            token.needsOAuth2FA = true
            token.oauth2FATimestamp = Date.now()
          }
        } else {
          token.role = (user as any).role || "user"
        }
      }
      
      // Clear needsOAuth2FA flag after 1 minute (60000ms) to allow for 2FA completion
      // This prevents infinite redirects while giving time for 2FA verification
      if (token.needsOAuth2FA && token.oauth2FATimestamp && 
          (Date.now() - (token.oauth2FATimestamp as number)) > 60000) {
        token.needsOAuth2FA = false
        delete token.oauth2FATimestamp
      }
      
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        // Safely access token properties with proper type checking
        (session.user as any).twoFactorEnabled = !!(token as any).twoFactorEnabled;
        (session.user as any).needsOAuth2FA = !!(token as any).needsOAuth2FA;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Set default preferences for new Google users
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "user",
          emailNotifications: true,
          pushNotifications: true,
          theme: "system",
          language: "English",
          country: "United States",
        },
      })
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
