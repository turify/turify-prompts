import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const protectedRoutes = ["/dashboard", "/profile", "/settings", "/admin"]
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const isAdminRoute = adminRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Skip OAuth 2FA page to avoid redirect loops
  if (pathname.includes("/auth/oauth-2fa")) {
    return NextResponse.next()
  }

  // Check for custom session cookies (email/password auth)
  const sessionToken = request.cookies.get("session-token")?.value
  const userId = request.cookies.get("user-id")?.value
  const hasCustomSession = sessionToken && userId

  // Check for NextAuth JWT token (OAuth auth)
  const nextAuthToken = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  const hasNextAuthSession = !!nextAuthToken

  // Allow access if either authentication method is valid
  const isAuthenticated = hasCustomSession || hasNextAuthSession

  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Check for OAuth 2FA requirement (only for protected routes with NextAuth session)
  if (isProtectedRoute && hasNextAuthSession && !hasCustomSession) {
    try {
      // Check if this is an OAuth user who needs 2FA verification
      if (nextAuthToken?.needsOAuth2FA && nextAuthToken?.twoFactorEnabled) {
        // Check if the OAuth 2FA timestamp is recent (within 1 minute of login)
        const oauth2FATimestamp = nextAuthToken?.oauth2FATimestamp as number
        const oneMinuteAgo = Date.now() - 1 * 60 * 1000
        
        console.log("OAuth 2FA check:", {
          needsOAuth2FA: nextAuthToken.needsOAuth2FA,
          twoFactorEnabled: nextAuthToken.twoFactorEnabled,
          oauth2FATimestamp,
          oneMinuteAgo,
          isRecent: oauth2FATimestamp && oauth2FATimestamp > oneMinuteAgo,
          pathname
        })
        
        // Only redirect if the 2FA flag was set recently (within 1 minute)
        if (oauth2FATimestamp && oauth2FATimestamp > oneMinuteAgo) {
          console.log("Redirecting to OAuth 2FA page")
          const url = new URL("/auth/oauth-2fa", request.url)
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.error("OAuth 2FA middleware error:", error)
      // Continue without redirect on error
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}
