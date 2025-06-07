import { NextResponse } from "next/server"
import { testLangSmithConnection } from "@/lib/langgraph-service"

export async function GET() {
  try {
    const result = await testLangSmithConnection()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to test LangSmith connection" },
      { status: 500 }
    )
  }
} 