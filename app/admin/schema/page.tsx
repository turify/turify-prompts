import { SchemaFix } from "@/components/schema-fix"
import { requireAdmin } from "@/app/actions/auth-actions"

// Force this page to be dynamic due to authentication
export const dynamic = 'force-dynamic'

export default async function AdminSchemaPage() {
  // Check if user is admin
  await requireAdmin()

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Database Schema Management</h1>
      <SchemaFix />
    </div>
  )
}
