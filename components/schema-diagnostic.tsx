"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { runSchemaDiagnostic } from "@/app/actions/schema-diagnostic"
import { AlertCircle, CheckCircle, Database, RefreshCw, XCircle } from "lucide-react"

export function SchemaDiagnostic() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRunDiagnostic = async () => {
    setIsRunning(true)
    setError(null)

    try {
      const result = await runSchemaDiagnostic()

      if (result.success) {
        setResults(result.results)
      } else {
        setError(result.error || "Failed to run diagnostic")
      }
    } catch (err) {
      console.error("Error running diagnostic:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card className="border-2 border-brand-blue/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-blue/10 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-brand-blue" />
          Schema Diagnostic
        </CardTitle>
        <CardDescription>Check the status of database schemas and tables</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Button
            onClick={handleRunDiagnostic}
            disabled={isRunning}
            className="bg-brand-blue hover:bg-brand-blue/90 flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Diagnostic...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Run Diagnostic
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Error</p>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="p-4 rounded-md bg-muted/50 border">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Connection
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  {results.database.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>
                    {results.database.connected
                      ? `Connected (${results.database.version?.split(",")[0] || ""})`
                      : "Not connected"}
                  </span>
                </div>
                {results.database.error && <p className="mt-1 text-sm text-red-600">{results.database.error}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-md bg-muted/50 border">
                  <h3 className="font-medium mb-2">promptcraft Schema</h3>
                  <div className="flex items-center gap-2 text-sm">
                    {results.schemas.promptcraft.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{results.schemas.promptcraft.exists ? "Exists" : "Does not exist"}</span>
                  </div>
                  {results.schemas.promptcraft.error && (
                    <p className="mt-1 text-sm text-red-600">{results.schemas.promptcraft.error}</p>
                  )}

                  {results.schemas.promptcraft.exists && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Tables</h4>
                      <div className="space-y-1">
                        {Object.entries(results.tables.promptcraft).map(([tableName, tableInfo]: [string, any]) => (
                          <div key={tableName} className="flex items-center gap-2 text-xs">
                            {tableInfo.exists ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span>{tableName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-md bg-muted/50 border">
                  <h3 className="font-medium mb-2">turify Schema</h3>
                  <div className="flex items-center gap-2 text-sm">
                    {results.schemas.turify.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span>{results.schemas.turify.exists ? "Exists" : "Does not exist"}</span>
                  </div>
                  {results.schemas.turify.error && (
                    <p className="mt-1 text-sm text-red-600">{results.schemas.turify.error}</p>
                  )}

                  {results.schemas.turify.exists && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Tables</h4>
                      <div className="space-y-1">
                        {Object.entries(results.tables.turify).map(([tableName, tableInfo]: [string, any]) => (
                          <div key={tableName} className="flex items-center gap-2 text-xs">
                            {tableInfo.exists ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-500" />
                            )}
                            <span>{tableName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/20 border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          <p>
            This diagnostic tool checks the existence of schemas and tables in your database. Use it to troubleshoot
            schema-related issues.
          </p>
        </div>
      </CardFooter>
    </Card>
  )
}
