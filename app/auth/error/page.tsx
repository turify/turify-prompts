import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Authentication Error</h2>
        <p className="mt-2 text-center text-sm text-gray-600">There was a problem with your authentication request.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <p className="text-center">Please try again or contact support if the problem persists.</p>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/login">Return to login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
