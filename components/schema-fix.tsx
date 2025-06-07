"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fixDatabaseSchema } from "@/app/actions/fix-schema"

export function SchemaFix() {
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleFix = async () => {
    setIsFixing(true)
    try {
      const result = await fixDatabaseSchema()
      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        message: `Error fixing schema: ${error instanceof Error ? error.message : String(error)}`,
      })
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fix Database Schema</CardTitle>
        <CardDescription>Fix database schema issues related to UUID columns being defined as integers</CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <div
            className={`mb-4 p-4 rounded-md ${
              result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {result.message}
          </div>
        )}
        <p className="text-sm text-gray-500 mb-4">
          This utility will fix any issues with the database schema where UUID columns are incorrectly defined as
          integers instead of text.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleFix} disabled={isFixing}>
          {isFixing ? "Fixing Schema..." : "Fix Schema"}
        </Button>
      </CardFooter>
    </Card>
  )
}
