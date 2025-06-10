import { AdminAnalyticsDashboard } from "@/components/admin/admin-analytics-dashboard"
import { requireAdmin } from "@/app/actions/auth-actions"

// Force this page to be dynamic due to authentication
export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  // Check if user is admin
  await requireAdmin()

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Analytics Dashboard</h1>
      <AdminAnalyticsDashboard />
    </div>
  )
}
