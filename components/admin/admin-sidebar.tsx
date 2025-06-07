"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, Users, FileText, Settings, Home, LogOut, Database } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Prompts",
      href: "/admin/prompts",
      icon: FileText,
    },
    {
      name: "Blog Submissions",
      href: "/admin/blog-submissions",
      icon: FileText,
    },
    {
      name: "Schema",
      href: "/admin/schema",
      icon: Database,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-2xl gradient-text">Turify</span>
        </Link>
        <div className="text-sm text-muted-foreground mt-1">Admin Dashboard</div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href ? "bg-brand-purple text-white" : "text-card-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-card-foreground hover:bg-accent hover:text-accent-foreground w-full text-left mt-8"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </nav>
    </div>
  )
}
