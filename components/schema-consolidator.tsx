"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { checkTurifySchema, consolidateSchemas } from "@/app/actions/schema-cleanup"
import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react"

export function SchemaConsolidator() {
  const [isChecking, setIsChecking] = useState(true)
  const [isConsolidating, setIsConsolidating] = useState(false)
  const [turifyExists, setTurifyExists] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  // Check if turify schema exists on component mount
  useState(() => {
    checkSchema()
  })

  const checkSchema = async () => {
    setIsChecking(true)
    setError(null)

    try {
      const result = await checkTurifySchema()

      if (result.success) {
        setTurifyExists(result.exists)
        if (!result.exists) {
          setIsCompleted(true)
        }
      } else {
        setError(result.error || "Failed to check schema")
        toast({
          title: "Error",
          description: result.error || "Failed to check schema",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error checking schema:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred while checking the schema",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleConsolidate = async () => {
    setIsConsolidating(true)
    setError(null)
    setResult(null)

    try {
      const result = await consolidateSchemas()

      if (result.success) {
        setIsCompleted(true)
        setResult(result)
        setTurifyExists(false)
        toast({
          title: "Success",
          description: result.message || "Schemas consolidated successfully",
        })
      } else {
        setError(result.error || "Failed to consolidate schemas")
        toast({
          title: "Error",
          description: result.error || "Failed to consolidate schemas",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error consolidating schemas:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred while consolidating schemas",
        variant: "destructive",
      })
    } finally {
      setIsConsolidating(false)
    }
  }

  // If no turify schema exists and we're not in an error state, don't show anything
  if (!turifyExists && !error && !isChecking && isCompleted) {
    return null
  }

  return (
    <Card className="border-2 border-orange-200 shadow-lg mb-6">
      <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-50">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-500" />
          Database Schema Cleanup
        </CardTitle>
        <CardDescription>Consolidate database schemas to eliminate duplicate tables</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {isChecking ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 text-orange-500 animate-spin mr-2" />
            <span>Checking database schemas...</span>
          </div>
        ) : (
          <>
            {turifyExists && !isCompleted && (
              <Alert className="mb-4 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertTitle>Duplicate schemas detected</AlertTitle>
                <AlertDescription>
                  Your database has tables in both the "public" and "turify" schemas. This can cause confusion and data
                  inconsistency. Click the button below to consolidate all data into the "public" schema and remove the
                  "turify" schema.
                </AlertDescription>
              </Alert>
            )}

            {isCompleted && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Schemas consolidated</AlertTitle>
                <AlertDescription>
                  All data has been consolidated into the "public" schema. The "turify" schema has been removed.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="mt-4 text-sm">
                <p className="font-medium mb-2">Migration details:</p>
                <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {turifyExists && !isCompleted && (
          <Button onClick={handleConsolidate} disabled={isConsolidating} className="bg-orange-500 hover:bg-orange-600">
            {isConsolidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Consolidating Schemas...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Consolidate Schemas
              </>
            )}
          </Button>
        )}

        {error && (
          <Button onClick={checkSchema} variant="outline" className="ml-2">
            Check Again
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
