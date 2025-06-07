import { PrismaClient } from '@prisma/client'

// Global is used here to prevent exhausting the database connection limit
// during development, when this module is re-imported
declare global {
  var __prisma: PrismaClient | undefined
}

// Create a single Prisma instance to be reused throughout the application
const prisma = global.__prisma || new PrismaClient()

// In development, store the instance on the global object
// to prevent creating new instances on hot reloads
if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma
}

export { prisma }

// Legacy compatibility layer for existing code
// These functions provide backwards compatibility with the existing SQL query interface

/**
 * Execute a SQL query using Prisma's raw query capability
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query result rows
 */
export async function executeSql<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    // Replace $1, $2, etc. with PostgreSQL parameter format
    let formattedQuery = query
    params.forEach((param, index) => {
      formattedQuery = formattedQuery.replace(`$${index + 1}`, `$${index + 1}`)
    })

    const result = await prisma.$queryRawUnsafe<T[]>(formattedQuery, ...params)
    return Array.isArray(result) ? result : [result] as T[]
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

/**
 * Alias for executeSql for backward compatibility
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query result rows
 */
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  return executeSql<T>(query, params)
}

/**
 * Tagged template function for raw SQL queries (backwards compatibility)
 * @param query Template strings array
 * @param values Template values
 * @returns Query result
 */
export const sql = async (query: TemplateStringsArray, ...values: any[]) => {
  try {
    // Convert template literal to a regular string with parameters
    let formattedQuery = ''
    for (let i = 0; i < query.length; i++) {
      formattedQuery += query[i]
      if (i < values.length) {
        formattedQuery += `$${i + 1}`
      }
    }

    const result = await prisma.$queryRawUnsafe(formattedQuery, ...values)
    return Array.isArray(result) ? result : [result]
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

/**
 * Check if the database is initialized
 * @returns True if database is initialized
 */
export async function checkDatabaseInitialized(): Promise<boolean> {
  try {
    // Only execute database queries on the server side
    if (typeof window !== "undefined") {
      console.warn("Database queries should only be executed on the server side")
      return false
    }

    // Try to query the users table to check if it exists
    await prisma.user.findFirst()
    return true
  } catch (error) {
    console.error("Error checking database initialization:", error)
    return false
  }
}

/**
 * Get the schema for a specific table
 * @param tableName Name of the table
 * @returns Array of column information
 */
export async function getTableSchema(tableName: string) {
  try {
    const result = await executeSql(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName])
    
    return result
  } catch (error) {
    console.error(`Error getting table schema for ${tableName}:`, error)
    throw error
  }
}
