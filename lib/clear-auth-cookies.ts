"use server"

import { cookies } from "next/headers"

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  
  // Clear NextAuth related cookies
  const nextAuthCookies = [
    'next-auth.session-token',
    'next-auth.csrf-token', 
    'next-auth.callback-url',
    '__Secure-next-auth.session-token',
    '__Host-next-auth.csrf-token',
    'session-token',
    'user-id'
  ]
  
  nextAuthCookies.forEach(cookieName => {
    try {
      cookieStore.delete(cookieName)
    } catch (error) {
      // Ignore errors for cookies that don't exist
    }
  })
  
  return { success: true, message: "Auth cookies cleared" }
} 