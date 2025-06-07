import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Force this route to be dynamic
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 