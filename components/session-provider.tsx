"use client"

import type React from "react"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/lib/auth-context"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AuthProvider>
        <Navbar />
        {children}
      </AuthProvider>
    </NextAuthSessionProvider>
  )
}
