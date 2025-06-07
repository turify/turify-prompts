"use server"

import { executeSql } from "@/lib/db"

export async function addImpressionsColumn() {
  try {
    // Check if the impressions column exists
    const columnExists = await executeSql(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'prompts' 
        AND column_name = 'impressions'
      ) as exists
    `)
    
    if (columnExists[0]?.exists) {
      console.log("Impressions column already exists")
      return {
        success: true,
        created: false,
        message: "Impressions column already exists"
      }
    }

    // Add the impressions column if it doesn't exist
    await executeSql(`
      ALTER TABLE public.prompts 
      ADD COLUMN impressions INTEGER DEFAULT 0
    `)

    console.log("Impressions column added successfully")
    return {
      success: true,
      created: true,
      message: "Impressions column added successfully"
    }
  } catch (error) {
    console.error("Error adding impressions column:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // If the column already exists, that's not really an error
    if (errorMessage.includes("already exists")) {
      return {
        success: true,
        created: false,
        message: "Impressions column already exists"
      }
    }
    
    return {
      success: false,
      created: false,
      error: `Failed to add impressions column: ${errorMessage}`
    }
  }
}

export async function checkTableStructure(tableName: string) {
  try {
    const columns = await executeSql(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName])
    
    return {
      success: true,
      columns
    }
  } catch (error) {
    console.error(`Error checking table structure for ${tableName}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
} 