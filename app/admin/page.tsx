import { requireAdmin } from "@/app/actions/auth-actions"
import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview"

export default async function AdminDashboardPage() {
  // Check if user is admin
  await requireAdmin()

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
      <AdminDashboardOverview />
    </div>
  )
}
