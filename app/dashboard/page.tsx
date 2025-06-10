import { requireAuth } from "@/app/actions/auth-actions"
import { DashboardClient } from "./DashboardClient"

// Force this page to be dynamic due to authentication
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await requireAuth()

  return <DashboardClient user={user} />
}
