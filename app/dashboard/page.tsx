import { requireAuth } from "@/app/actions/auth-actions"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  // Check if user is authenticated
  const user = await requireAuth()

  return <DashboardClient user={user} />
}
