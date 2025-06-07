"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { migrateSchemaName } from "@/app/actions/migrate-schema"
import { useToast } from "@/components/ui/use-toast"

export function SchemaMigrator() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [isMigrated, setIsMigrated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleMigrate = async () => {
    setIsMigrating(true)
    setError(null)

    try {
      const result = await migrateSchemaName()

      if (result.success) {
        setIsMigrated(true)
        toast({
          title: "Success",
          description: result.message || "Schema migrated successfully!",
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
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred while migrating the schema",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <Card className="border-2 border-brand-purple/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10">
        <CardTitle>Schema Migration Required</CardTitle>
        <CardDescription>The database schema needs to be updated to reflect the new app name.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-muted-foreground mb-4">
          Click the button below to migrate the database schema from 'promptcraft' to 'turify'. This will copy all your
          existing data to the new schema.
        </p>
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        {isMigrated && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
            <p className="font-medium">Success!</p>
            <p>Schema migrated successfully. You can now use the application with the new schema.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleMigrate}
          disabled={isMigrating || isMigrated}
          className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity"
        >
          {isMigrating ? "Migrating..." : isMigrated ? "Migrated" : "Migrate Schema"}
        </Button>
      </CardFooter>
    </Card>
  )
}
