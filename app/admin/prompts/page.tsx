import { AdminPromptsList } from "@/components/admin/admin-prompts-list"
import { requireAdmin } from "@/app/actions/auth-actions"

// Force this page to be dynamic due to authentication
export const dynamic = 'force-dynamic'

export default async function AdminPromptsPage() {
  // Check if user is admin
  await requireAdmin()

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Manage Prompts</h1>
      <AdminPromptsList />
    </div>
  )
}
