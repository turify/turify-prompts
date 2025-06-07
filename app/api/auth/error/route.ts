import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const error = url.searchParams.get("error") || "Default"

  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    CredentialsSignin: "Invalid email or password. Please try again.",
    Default: "An authentication error occurred. Please try again.",
  }

  const errorMessage = errorMessages[error] || errorMessages.Default

  return NextResponse.json(
    {
      error: error,
      message: errorMessage,
    },
    { status: 400 },
  )
}
