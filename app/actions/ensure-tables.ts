"use server"

import { prisma } from "@/lib/db"

export async function ensurePromptsTable() {
  try {
    console.log("Checking database tables...")

    // Try to query the prompts table to check if it exists and is accessible
    try {
      await prisma.prompt.findFirst()
      console.log("Prompts table is accessible")
      
      return {
        success: true,
        created: false,
        message: "Database tables already exist and are accessible"
      }
    } catch (error) {
      console.error("Error accessing prompts table:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Check if it's a table not found error
      if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        console.log("Tables don't exist, need to run Prisma migrations")
        
        return {
          success: false,
          created: false,
          error: "Database tables do not exist. Please run 'pnpm prisma db push' or 'pnpm prisma migrate dev' to create the database schema."
        }
      }
      
      // Other database errors
      return {
        success: false,
        created: false,
        error: `Database access error: ${errorMessage}. Please check your database connection and permissions.`
      }
    }
  } catch (error) {
    console.error("Error ensuring prompts table:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return {
      success: false,
      created: false,
      error: `Failed to check database tables: ${errorMessage}`
    }
  }
}

export async function checkDatabaseSchema() {
  try {
    // Get table information from the database
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    const expectedTables = [
      'users',
      'accounts', 
      'sessions',
      'verification_tokens',
      'prompts',
      'prompt_versions',
      'prompt_evaluations',
      'prompt_outputs',
      'improvement_suggestions',
      'favorites',
      'analytics'
    ]
    
    const existingTables = tables.map((t: { table_name: string }) => t.table_name)
    const missingTables = expectedTables.filter(table => !existingTables.includes(table))
    
    return {
      success: true,
      existingTables,
      missingTables,
      allTablesExist: missingTables.length === 0
    }
  } catch (error) {
    console.error("Error checking database schema:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
} 