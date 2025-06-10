import { requireAdmin } from "@/app/actions/auth-actions"

// Force this page to be dynamic due to authentication
export const dynamic = 'force-dynamic'
import { BlogSubmissionsAdmin } from "./BlogSubmissionsAdmin"

export const metadata = {
  title: "Blog Submissions - Admin",
  description: "Manage blog submissions for premium membership program",
}

export default async function BlogSubmissionsAdminPage() {
  // Check if user is admin
  await requireAdmin()

  return <BlogSubmissionsAdmin />
} 