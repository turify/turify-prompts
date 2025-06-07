import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and is an admin
  // In a real app, you would check a role or permission
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }

  // For demo purposes, we're allowing any authenticated user
  // In a real app, you would check if the user has admin privileges

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-50">{children}</div>
    </div>
  )
}
