"use server"

import { sql, getTableSchema } from "@/lib/db"

export async function fixDatabaseSchema() {
  try {
    console.log("Starting schema fix...")

    // Check if users table exists and has the correct schema
    const usersExists = await checkTableExists("users")
    if (usersExists) {
      const usersSchema = await getTableSchema("users")
      const idColumn = usersSchema.find((col) => col.column_name === "id")

      if (idColumn && idColumn.data_type !== "text") {
        console.log("Fixing users.id column type...")
        await sql.query(`
          ALTER TABLE users 
          ALTER COLUMN id TYPE TEXT USING id::TEXT
        `)
      }
    }

    // Check if sessions table exists and has the correct schema
    const sessionsExists = await checkTableExists("sessions")
    if (sessionsExists) {
      const sessionsSchema = await getTableSchema("sessions")

      const idColumn = sessionsSchema.find((col) => col.column_name === "id")
      if (idColumn && idColumn.data_type !== "text") {
        console.log("Fixing sessions.id column type...")
        await sql.query(`
          ALTER TABLE sessions 
          ALTER COLUMN id TYPE TEXT USING id::TEXT
        `)
      }

      const userIdColumn = sessionsSchema.find((col) => col.column_name === "user_id")
      if (userIdColumn && userIdColumn.data_type !== "text") {
        console.log("Fixing sessions.user_id column type...")
        await sql.query(`
          ALTER TABLE sessions 
          ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT
        `)
      }
    }

    console.log("Schema fix completed successfully")
    return { success: true, message: "Database schema fixed successfully" }
  } catch (error) {
    console.error("Error fixing database schema:", error)
    return { success: false, message: `Error fixing database schema: ${error}` }
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql.query(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      ) as exists
    `,
      [tableName],
    )
    return result.rows && result.rows.length > 0 ? result.rows[0].exists : false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}
