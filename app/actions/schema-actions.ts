// app/actions/schema-actions.ts

import { executeSql } from "@/lib/db"

export async function someAction() {
  try {
    const result = await executeSql("SELECT 1")
    return result
  } catch (error) {
    console.error("Error in someAction:", error)
    return null
  }
}
