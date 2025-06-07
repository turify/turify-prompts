"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export function PrismaDbInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleInitialize = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      })

      const result = await response.json()

      if (result.success) {
        setIsInitialized(true)
        toast({
          title: "Success",
          description: "Database initialized successfully!",
        })
      } else {
        setError(result.error || "Failed to initialize database")
        toast({
          title: "Error",
          description: result.error || "Failed to initialize database",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error initializing database:", err)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred while initializing the database",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card className="border-2 border-brand-purple/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10">
        <CardTitle>Database Setup Required</CardTitle>
        <CardDescription>The database tables need to be created before you can use the application.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-muted-foreground mb-4">
          Click the button below to initialize the database. This will create all the necessary tables for Turify.
        </p>
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        {isInitialized && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">
            <p className="font-medium">Success!</p>
            <p>Database initialized successfully. You can now use the application.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleInitialize}
          disabled={isInitializing || isInitialized}
          className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity"
        >
          {isInitializing ? "Initializing..." : isInitialized ? "Initialized" : "Initialize Database"}
        </Button>
      </CardFooter>
    </Card>
  )
}
