import { sql } from "./db"

export async function ensureTurifySchema() {
  try {
    // Check if the turify schema exists
    const schemaResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata
        WHERE schema_name = 'turify'
      ) as exists
    `

    const schemaExists = schemaResult[0]?.exists === true

    if (!schemaExists) {
      console.log("Creating turify schema...")
      await sql`CREATE SCHEMA turify`
      return {
        success: true,
        message: "Turify schema created successfully",
        created: true,
      }
    }

    return {
      success: true,
      message: "Turify schema already exists",
      created: false,
    }
  } catch (error) {
    console.error("Error ensuring turify schema exists:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to ensure turify schema exists",
      created: false,
    }
  }
}

export async function checkSchemaExists(schemaName: string) {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata
        WHERE schema_name = ${schemaName}
      ) as exists
    `

    return {
      success: true,
      exists: result[0]?.exists === true,
    }
  } catch (error) {
    console.error(`Error checking if schema ${schemaName} exists:`, error)
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : `Failed to check if schema ${schemaName} exists`,
    }
  }
}

export async function checkTableExists(schemaName: string, tableName: string) {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = ${schemaName}
        AND table_name = ${tableName}
      ) as exists
    `

    return {
      success: true,
      exists: result[0]?.exists === true,
    }
  } catch (error) {
    console.error(`Error checking if table ${schemaName}.${tableName} exists:`, error)
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : `Failed to check if table ${schemaName}.${tableName} exists`,
    }
  }
}
