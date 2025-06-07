import { requireAuth } from "@/app/actions/auth-actions"

export default async function ProfilePage() {
  // Check if user is authenticated
  const user = await requireAuth()

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Profile</h1>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-200"></div>
          <div>
            <h2 className="text-xl font-semibold">{user?.name}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium">Account Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium">{user?.role || "User"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since:</span>
              <span className="font-medium">May 2023</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
