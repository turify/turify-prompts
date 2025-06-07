import { AdminPromptsList } from "@/components/admin/admin-prompts-list"
import { requireAdmin } from "@/app/actions/auth-actions"

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
