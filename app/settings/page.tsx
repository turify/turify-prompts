import { requireAuth } from "@/app/actions/auth-actions"

// Force this page to be dynamic due to authentication
export const dynamic = 'force-dynamic'
import { SettingsForm } from "./settings-form"

export default async function SettingsPage() {
  // This will redirect to login if not authenticated
  const user = await requireAuth()

  return <SettingsForm user={user} />
}
