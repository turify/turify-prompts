"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<{
    checked: boolean
    hasDbUrl: boolean
    hasAuthSecret: boolean
    hasEmailConfig: boolean
    hasGoogleConfig: boolean
    hasLangChainConfig: boolean
  }>({
    checked: false,
    hasDbUrl: false,
    hasAuthSecret: false,
    hasEmailConfig: false,
    hasGoogleConfig: false,
    hasLangChainConfig: false,
  })

  const [isLoading, setIsLoading] = useState(false)

  const checkEnvVariables = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/check-env")
      const data = await response.json()

      setEnvStatus({
        checked: true,
        hasDbUrl: data.hasDbUrl,
        hasAuthSecret: data.hasAuthSecret,
        hasEmailConfig: data.hasEmailConfig,
        hasGoogleConfig: data.hasGoogleConfig,
        hasLangChainConfig: data.hasLangChainConfig,
      })
    } catch (error) {
      console.error("Error checking environment variables:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkEnvVariables()
  }, [])

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Environment Variables Check</CardTitle>
        <CardDescription>Check if all required environment variables are properly configured</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {envStatus.checked ? (
          <>
            <EnvCheckItem
              title="Database Connection"
              isConfigured={envStatus.hasDbUrl}
              envVar="DATABASE_URL"
              description="Required for database operations"
            />
            <EnvCheckItem
              title="Authentication Secret"
              isConfigured={envStatus.hasAuthSecret}
              envVar="NEXTAUTH_SECRET"
              description="Required for secure authentication"
            />
            <EnvCheckItem
              title="Email Configuration"
              isConfigured={envStatus.hasEmailConfig}
              envVar="EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM"
              description="Required for email authentication"
            />
            <EnvCheckItem
              title="Google OAuth"
              isConfigured={envStatus.hasGoogleConfig}
              envVar="GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
              description="Required for Google authentication"
            />
            <EnvCheckItem
              title="LangChain/LangSmith Tracing"
              isConfigured={envStatus.hasLangChainConfig}
              envVar="LANGCHAIN_API_KEY, LANGCHAIN_PROJECT"
              description="Optional for AI request tracing and debugging"
            />
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Checking environment variables...</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkEnvVariables} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            "Refresh Check"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function EnvCheckItem({
  title,
  isConfigured,
  envVar,
  description,
}: {
  title: string
  isConfigured: boolean
  envVar: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">
        {isConfigured ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        {!isConfigured && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Environment Variable</AlertTitle>
            <AlertDescription>
              Please set the <code className="bg-muted px-1 py-0.5 rounded">{envVar}</code> environment variable.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
