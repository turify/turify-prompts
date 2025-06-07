"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function AnalyticsTracker() {
  const pathname = usePathname()
  const [prevPathname, setPrevPathname] = useState<string | null>(null)

  useEffect(() => {
    // Skip tracking for API routes and admin pages
    if (pathname.startsWith("/api/") || pathname.startsWith("/admin")) {
      return
    }

    // Only track if the pathname has changed
    if (prevPathname !== pathname) {
      const trackPageView = async () => {
        try {
          await fetch("/api/analytics/pageview", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              path: pathname,
              referrer: document.referrer || undefined,
            }),
          })
        } catch (error) {
          console.error("Error tracking page view:", error)
        }
      }

      trackPageView()
      setPrevPathname(pathname)
    }
  }, [pathname, prevPathname])

  return null
}
