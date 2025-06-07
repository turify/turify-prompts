"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { initializeTurifySchema } from "@/app/actions/initialize-schema"
import { Database, RefreshCw } from "lucide-react"

export function SchemaInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleInitialize = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const result = await initializeTurifySchema()

      if (result.success) {
        setInitialized(true)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        setError(result.error || "Failed to initialize schema")
        toast({
          title: "Error",
          description: result.error || "Failed to initialize schema",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error initializing schema:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "An unexpected error occurred while initializing the schema",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card className="border-2 border-green-500/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-500" />
          Initialize Turify Schema
        </CardTitle>
        <CardDescription>Create the turify schema and all required tables</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will create the turify schema and all necessary tables for the application to function properly. Use
            this if you're setting up the application for the first time or if you're experiencing schema-related
            errors.
          </p>

          <Button
            onClick={handleInitialize}
            disabled={isInitializing || initialized}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            {isInitializing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : initialized ? (
              "Initialized"
            ) : (
              <>
                <Database className="h-4 w-4" />
                Initialize Schema
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800">
              <p className="font-medium">Error</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {initialized && (
            <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800">
              <p className="font-medium">Success</p>
              <p className="mt-1 text-sm">The turify schema and tables have been initialized successfully.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> This operation is safe to run multiple times. It will not overwrite existing data.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
