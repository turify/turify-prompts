"use server"

import { sql } from "@/lib/db"

/**
 * Check if the turify schema exists
 */
export async function checkTurifySchema() {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.schemata
        WHERE schema_name = 'turify'
      ) as exists;
    `
    return {
      success: true,
      exists: result.length > 0 && result[0].exists === true,
    }
  } catch (error) {
    console.error("Error checking turify schema:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check turify schema",
    }
  }
}

/**
 * Get a list of tables in the turify schema
 */
export async function getTurifyTables() {
  try {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'turify'
      ORDER BY table_name;
    `
    return {
      success: true,
      tables: result.map((row: any) => row.table_name),
    }
  } catch (error) {
    console.error("Error getting turify tables:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get turify tables",
    }
  }
}

/**
 * Migrate data from turify schema to public schema
 */
export async function migrateToPublicSchema() {
  try {
    console.log("Starting migration from turify to public schema...")

    // Check if turify schema exists
    const schemaCheck = await checkTurifySchema()
    if (!schemaCheck.success) {
      return {
        success: false,
        error: schemaCheck.error || "Failed to check turify schema",
      }
    }

    if (!schemaCheck.exists) {
      return {
        success: true,
        message: "No migration needed - turify schema doesn't exist",
      }
    }

    // Get list of tables in turify schema
    const tablesResult = await getTurifyTables()
    if (!tablesResult.success) {
      return {
        success: false,
        error: tablesResult.error || "Failed to get turify tables",
      }
    }

    const tables = tablesResult.tables
    if (tables.length === 0) {
      return {
        success: true,
        message: "No tables found in turify schema",
      }
    }

    console.log(`Found ${tables.length} tables in turify schema:`, tables)

    // Migrate each table
    for (const table of tables) {
      console.log(`Migrating table: ${table}`)

      // Check if table exists in public schema
      const publicTableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = ${table}
        ) as exists;
      `

      const tableExists = publicTableExists.length > 0 && publicTableExists[0].exists === true

      if (!tableExists) {
        console.log(`Table ${table} doesn't exist in public schema, creating it...`)

        // Get table structure
        const tableStructure = await sql`
          SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'turify'
          AND table_name = ${table}
          ORDER BY ordinal_position;
        `

        // Create table in public schema
        let createTableQuery = `CREATE TABLE public.${table} (`

        const columns = tableStructure.map((col: any) => {
          let columnDef = `"${col.column_name}" ${col.data_type}`

          if (col.character_maximum_length) {
            columnDef += `(${col.character_maximum_length})`
          }

          if (col.is_nullable === "NO") {
            columnDef += " NOT NULL"
          }

          if (col.column_default) {
            columnDef += ` DEFAULT ${col.column_default}`
          }

          return columnDef
        })

        createTableQuery += columns.join(", ")

        // Add primary key if it exists
        try {
          const pkResult = await sql`
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = ${"turify." + table}::regclass
            AND i.indisprimary;
          `

          if (pkResult && pkResult.length > 0) {
            createTableQuery += `, PRIMARY KEY (${pkResult.map((pk: any) => `"${pk.attname}"`).join(", ")})`
          }
        } catch (error) {
          console.log(`No primary key found for table ${table}`)
        }

        createTableQuery += ");"

        // Create the table
        await sql.query(createTableQuery)
        console.log(`Created table ${table} in public schema`)
      } else {
        console.log(`Table ${table} already exists in public schema`)
      }

      // Copy data from turify to public
      try {
        // Get column names
        const columns = await sql`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_schema = 'turify'
          AND table_name = ${table}
          ORDER BY ordinal_position;
        `

        const columnNames = columns.map((col: any) => col.column_name)
        const columnList = columnNames.map((name: string) => `"${name}"`).join(", ")

        // Check if public table has data
        const publicDataCount = await sql.query(`
          SELECT COUNT(*) as count FROM public.${table};
        `)

        const hasPublicData = publicDataCount.rows[0].count > 0

        if (hasPublicData) {
          console.log(`Public table ${table} already has data, skipping data migration`)
        } else {
          // Copy data
          await sql.query(`
            INSERT INTO public.${table} (${columnList})
            SELECT ${columnList} FROM turify.${table}
            ON CONFLICT DO NOTHING;
          `)

          console.log(`Copied data from turify.${table} to public.${table}`)
        }
      } catch (error) {
        console.error(`Error copying data for table ${table}:`, error)
      }
    }

    return {
      success: true,
      message: "Successfully migrated data from turify to public schema",
      tables: tables,
    }
  } catch (error) {
    console.error("Error migrating to public schema:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to migrate to public schema",
    }
  }
}

/**
 * Drop the turify schema
 */
export async function dropTurifySchema() {
  try {
    console.log("Dropping turify schema...")

    // Check if turify schema exists
    const schemaCheck = await checkTurifySchema()
    if (!schemaCheck.success) {
      return {
        success: false,
        error: schemaCheck.error || "Failed to check turify schema",
      }
    }

    if (!schemaCheck.exists) {
      return {
        success: true,
        message: "No cleanup needed - turify schema doesn't exist",
      }
    }

    // Drop the schema
    await sql`DROP SCHEMA turify CASCADE;`

    return {
      success: true,
      message: "Successfully dropped turify schema",
    }
  } catch (error) {
    console.error("Error dropping turify schema:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to drop turify schema",
    }
  }
}

/**
 * Consolidate schemas by migrating data from turify to public and then dropping turify
 */
export async function consolidateSchemas() {
  try {
    // Step 1: Migrate data from turify to public
    const migrationResult = await migrateToPublicSchema()
    if (!migrationResult.success) {
      return migrationResult
    }

    // Step 2: Drop turify schema
    const dropResult = await dropTurifySchema()
    if (!dropResult.success) {
      return dropResult
    }

    return {
      success: true,
      message: "Successfully consolidated schemas. All data is now in the public schema.",
      migrationResult,
      dropResult,
    }
  } catch (error) {
    console.error("Error consolidating schemas:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to consolidate schemas",
    }
  }
}
