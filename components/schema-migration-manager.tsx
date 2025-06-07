"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { migrateSchema, cleanupOldSchema } from "@/app/actions/schema-actions"
import { AlertCircle, CheckCircle2, ArrowRightCircle, Trash2 } from "lucide-react"

export function SchemaMigrationManager() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [isDropping, setIsDropping] = useState(false)
  const [migrationComplete, setMigrationComplete] = useState(false)
  const [dropComplete, setDropComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const { toast } = useToast()

  const handleMigrate = async () => {
    setIsMigrating(true)
    setError(null)
    setResult(null)

    try {
      const result = await migrateSchema()

      if (result.success) {
        setMigrationComplete(true)
        setResult(result.message)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        setError(result.error || "Failed to migrate schema")
        toast({
          title: "Error",
          description: result.error || "Failed to migrate schema",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error migrating schema:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "An unexpected error occurred while migrating the schema",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  const handleDropOldSchema = async () => {
    setIsDropping(true)
    setError(null)
    setResult(null)

    try {
      const result = await cleanupOldSchema()

      if (result.success) {
        setDropComplete(true)
        setResult(result.message)
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        setError(result.error || "Failed to drop old schema")
        toast({
          title: "Error",
          description: result.error || "Failed to drop old schema",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error dropping schema:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "An unexpected error occurred while dropping the old schema",
        variant: "destructive",
      })
    } finally {
      setIsDropping(false)
    }
  }

  return (
    <Card className="border-2 border-brand-purple/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10">
        <CardTitle className="flex items-center gap-2">
          <ArrowRightCircle className="h-5 w-5 text-brand-purple" />
          Schema Migration
        </CardTitle>
        <CardDescription>Migrate data from promptcraft schema to turify schema</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-md bg-muted/50">
            <div className="flex-shrink-0 mt-0.5">
              {migrationComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <ArrowRightCircle className="h-5 w-5 text-brand-purple" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Step 1: Migrate Schema</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Copy all tables and data from the promptcraft schema to the turify schema.
              </p>
            </div>
            <div>
              <Button
                onClick={handleMigrate}
                disabled={isMigrating || migrationComplete}
                className="bg-brand-purple hover:bg-brand-purple/90"
                size="sm"
              >
                {isMigrating ? "Migrating..." : migrationComplete ? "Completed" : "Migrate"}
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-md bg-muted/50">
            <div className="flex-shrink-0 mt-0.5">
              {dropComplete ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Trash2 className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Step 2: Drop Old Schema</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Remove the promptcraft schema after successful migration. This action cannot be undone.
              </p>
            </div>
            <div>
              <Button
                onClick={handleDropOldSchema}
                disabled={isDropping || dropComplete || !migrationComplete}
                variant="destructive"
                size="sm"
              >
                {isDropping ? "Dropping..." : dropComplete ? "Completed" : "Drop Schema"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Error</p>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {result && !error && (
            <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-medium">Success</p>
              </div>
              <p className="mt-1 text-sm">{result}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Note:</strong> Make sure to back up your data before performing these operations. The schema
            migration will copy all data, but it's always good to have a backup.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
