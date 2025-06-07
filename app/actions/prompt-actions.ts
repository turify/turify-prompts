"use server"

import { revalidatePath } from "next/cache"
import { executeSql, executeQuery } from "@/lib/db"
import { analyzePrompt, generatePromptOutput, generatePromptMetadata as generatePromptMetadataAI } from "@/lib/langgraph-service"

// Helper function to ensure scores are integers
function ensureInteger(value: any): number {
  if (value === undefined || value === null) {
    return 0
  }
  // Convert to number first in case it's a string
  const num = Number(value)
  // Round to nearest integer
  return Math.round(num)
}

/**
 * Create a new prompt with evaluation, output, and suggestions
 * @param formData Form data containing prompt information
 * @returns Object with success status and prompt ID or error message
 */
export async function createPromptWithEvaluation(formData: FormData) {
  try {
    const promptText = formData.get("promptText") as string
    const userId = (formData.get("userId") as string) || undefined
    const isPublic = formData.get("isPublic") === "true"

    // Optional fields - if provided, use them, otherwise auto-generate
    let title = (formData.get("title") as string) || undefined
    let description = (formData.get("description") as string) || undefined
    let industry = (formData.get("industry") as string) || undefined

    // Validate required fields
    if (!promptText) {
      return {
        success: false,
        error: "Prompt text is required",
      }
    }

    // Auto-generate title, description, and industry if not provided
    if (!title || !description || !industry) {
      // Get user's country for locale-aware metadata
      let userCountry: string | undefined
      if (userId) {
        try {
          const { getCurrentUser } = await import("@/app/actions/auth-actions")
          const user = await getCurrentUser()
          userCountry = user?.country
        } catch (error) {
          console.error("Error getting user country for metadata generation:", error)
          // Continue without country info
        }
      }
      
      const generatedMetadata = await generatePromptMetadataAI(promptText, userCountry)
      title = title || generatedMetadata.title
      description = description || generatedMetadata.description
      industry = industry || generatedMetadata.industry
    }

    console.log("Creating prompt with:", {
      title,
      promptText: promptText.substring(0, 50) + "...",
      description,
      industry,
      isPublic,
      userId,
    })

    // First, let's verify the table exists and is accessible
    try {
      console.log("Testing direct access to prompts table...")

      // Try a simple SELECT to verify table access
      const accessTest = await executeSql(`SELECT COUNT(*) as count FROM public.prompts WHERE 1=0`)

      console.log("Prompts table access test successful:", accessTest)
    } catch (accessError) {
      console.error("Cannot access prompts table:", accessError)
      const errorMessage = accessError instanceof Error ? accessError.message : String(accessError)

      if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        return {
          success: false,
          error: "Prompts table does not exist - database needs initialization",
        }
      } else if (errorMessage.includes("permission")) {
        return {
          success: false,
          error: "Permission denied accessing prompts table - check database user permissions",
        }
      } else {
        return {
          success: false,
          error: `Database access error: ${errorMessage}`,
        }
      }
    }

    // Create the prompt and let PostgreSQL generate the UUID
    try {
      console.log("Executing INSERT query with auto-generated UUID")

      // Insert without specifying ID - let PostgreSQL generate it
      const insertResult = await executeSql(
        `INSERT INTO public.prompts (title, prompt_text, description, industry, is_public, user_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [title, promptText, description, industry, isPublic, userId],
      )

      if (!insertResult || insertResult.length === 0 || !insertResult[0].id) {
        throw new Error("Failed to get prompt ID from database")
      }

      const promptId = insertResult[0].id
      console.log("Successfully created prompt with ID:", promptId)

      // Now, evaluate the prompt and add related data
      try {
        // Use LangGraph to analyze the prompt
        console.log("🔍 ORIGINAL EVALUATION: Using LangGraph AI service for prompt:", promptId)
        const analysis = await analyzePrompt(promptText)

        // Ensure scores are integers
        const clarityScore = ensureInteger(analysis.clarity_score)
        const specificityScore = ensureInteger(analysis.specificity_score)
        const contextualScore = ensureInteger(analysis.contextual_score)
        const effectivenessScore = ensureInteger(analysis.effectiveness_score)
        const overallScore = ensureInteger(analysis.overall_score)

        console.log("🔍 ORIGINAL EVALUATION: LangGraph scores:", {
          clarity: clarityScore,
          specificity: specificityScore,
          contextual: contextualScore,
          effectiveness: effectivenessScore,
          overall: overallScore
        })

        // Create the evaluation
        await executeSql(
          `INSERT INTO public.prompt_evaluations (prompt_id, clarity_score, specificity_score, contextual_score, effectiveness_score, feedback, created_at)
           VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, NOW())`,
          [
            promptId,
            clarityScore,
            specificityScore,
            contextualScore,
            effectivenessScore,
            JSON.stringify(analysis.feedback),
          ],
        )

        // Update the prompt with the overall score
        await executeSql(`UPDATE public.prompts SET score = $1 WHERE id = $2::uuid`, [overallScore, promptId])

        // Generate output using LangGraph
        const outputResult = await generatePromptOutput(promptText)

        // Create the output
        await executeSql(
          `INSERT INTO public.prompt_outputs (prompt_id, output_text, created_at)
           VALUES ($1::uuid, $2, NOW())`,
          [promptId, outputResult.output_text],
        )



        // Create the first version
        await executeSql(
          `INSERT INTO public.prompt_versions (prompt_id, version_number, prompt_text, score, created_at)
           VALUES ($1::uuid, 1, $2, $3, NOW())`,
          [promptId, promptText, overallScore],
        )
      } catch (langGraphError) {
        console.error("❌ ORIGINAL EVALUATION: LangGraph failed:", langGraphError)

        // Fall back to simulation if LangGraph fails
        console.log("⚠️ ORIGINAL EVALUATION: Falling back to simulation...")

        // For now, we'll simulate the evaluation process
        const evaluationScores = simulateEvaluation(promptText)
        
        console.log("🔍 ORIGINAL EVALUATION: Simulation scores:", {
          clarity: evaluationScores.clarity,
          specificity: evaluationScores.specificity,
          contextual: evaluationScores.contextual,
          effectiveness: evaluationScores.effectiveness
        })

        // Create the evaluation
        await executeSql(
          `INSERT INTO public.prompt_evaluations (prompt_id, clarity_score, specificity_score, contextual_score, effectiveness_score, feedback, created_at)
           VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, NOW())`,
          [
            promptId,
            evaluationScores.clarity,
            evaluationScores.specificity,
            evaluationScores.contextual,
            evaluationScores.effectiveness,
            JSON.stringify(evaluationScores.feedback),
          ],
        )

        // Calculate overall score (average of all scores)
        const overallScore = Math.round(
          (evaluationScores.clarity +
            evaluationScores.specificity +
            evaluationScores.contextual +
            evaluationScores.effectiveness) /
            4,
        )

        // Update the prompt with the overall score
        await executeSql(`UPDATE public.prompts SET score = $1 WHERE id = $2::uuid`, [overallScore, promptId])

        // Simulate generating output
        const outputText = await simulateOutput(promptText)

        // Create the output
        await executeSql(
          `INSERT INTO public.prompt_outputs (prompt_id, output_text, created_at)
           VALUES ($1::uuid, $2, NOW())`,
          [promptId, outputText],
        )

        // Create improvement suggestions
        const suggestions = await simulateSuggestions(promptText)
        // Insert each suggestion separately
        for (const item of suggestions) {
          await executeSql(
            `INSERT INTO public.improvement_suggestions (prompt_id, section, priority, suggestion, created_at)
             VALUES ($1::uuid, $2, $3, $4, NOW())`,
            [promptId, item.section || 'general', item.priority || 'medium', item.suggestion],
          )
        }

        // Create the first version
        await executeSql(
          `INSERT INTO public.prompt_versions (prompt_id, version_number, prompt_text, score, created_at)
           VALUES ($1::uuid, 1, $2, $3, NOW())`,
          [promptId, promptText, overallScore],
        )
      }

      revalidatePath("/prompts")
      revalidatePath(`/prompt/${promptId}`)

      return {
        success: true,
        promptId: promptId,
      }
    } catch (insertError) {
      console.error("Error during INSERT operation:", insertError)
      const errorMessage = insertError instanceof Error ? insertError.message : String(insertError)

      // Provide more specific error messages based on the actual error
      if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        return {
          success: false,
          error: "Database table does not exist - please initialize the database",
        }
      } else if (errorMessage.includes("duplicate key")) {
        return {
          success: false,
          error: "A prompt with similar content already exists",
        }
      } else if (errorMessage.includes("null value")) {
        return {
          success: false,
          error: "Required field is missing - please check your input",
        }
      } else {
        return {
          success: false,
          error: `Error creating prompt: ${errorMessage}`,
        }
      }
    }
  } catch (error) {
    console.error("Error creating prompt:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create prompt",
    }
  }
}

/**
 * Evaluate an existing prompt
 * @param formData Form data containing prompt text
 * @returns Object with evaluation results or error message
 */
export async function evaluatePrompt(formData: FormData) {
  try {
    const promptText = formData.get("promptText") as string

    // Validate required fields
    if (!promptText) {
      return {
        success: false,
        error: "Prompt text is required",
      }
    }

    try {
      // Use LangGraph to analyze the prompt
      const analysis = await analyzePrompt(promptText)

      // Ensure scores are integers
      const clarityScore = ensureInteger(analysis.clarity_score)
      const specificityScore = ensureInteger(analysis.specificity_score)
      const contextualScore = ensureInteger(analysis.contextual_score)
      const effectivenessScore = ensureInteger(analysis.effectiveness_score)
      const overallScore = ensureInteger(analysis.overall_score)

      // Generate output using LangGraph
      const outputResult = await generatePromptOutput(promptText)

      return {
        success: true,
        evaluation: {
          clarity_score: clarityScore,
          specificity_score: specificityScore,
          contextual_score: contextualScore,
          effectiveness_score: effectivenessScore,
          overall_score: overallScore,
          feedback: analysis.feedback,
        },
        output: outputResult.output_text,
        suggestions: [], // No longer generating suggestions
      }
    } catch (error) {
      console.error("Error using LangGraph:", error)

      // Fall back to simulation if LangGraph fails
      console.log("Falling back to simulation...")

      // For now, we'll simulate the evaluation process
      const evaluationScores = simulateEvaluation(promptText)

      // Calculate overall score (average of all scores)
      const overallScore = Math.round(
        (evaluationScores.clarity +
          evaluationScores.specificity +
          evaluationScores.contextual +
          evaluationScores.effectiveness) /
          4,
      )

      // Simulate generating output
      const outputText = await simulateOutput(promptText)

      // Simulate improvement suggestions
      const suggestions = await simulateSuggestions(promptText)

      return {
        success: true,
        evaluation: {
          clarity_score: evaluationScores.clarity,
          specificity_score: evaluationScores.specificity,
          contextual_score: evaluationScores.contextual,
          effectiveness_score: evaluationScores.effectiveness,
          overall_score: overallScore,
          feedback: evaluationScores.feedback,
        },
        output: outputText,
        suggestions,
      }
    }
  } catch (error) {
    console.error("Error evaluating prompt:", error)
    return {
      success: false,
      error: "Failed to evaluate prompt",
    }
  }
}

/**
 * Get prompt details with related data
 * @param promptId Prompt ID
 * @returns Object with prompt details or error message
 */
export async function getPromptDetails(promptId: string) {
  try {
    // Try to get the prompt from the public schema
    const promptResult = await executeSql(`SELECT * FROM public.prompts WHERE id = $1::uuid`, [promptId])

    if (!promptResult || promptResult.length === 0) {
      return {
        success: false,
        error: "Prompt not found",
      }
    }

    const prompt = promptResult[0]

    const versionsResult = await executeSql(
      `SELECT * FROM public.prompt_versions WHERE prompt_id = $1::uuid ORDER BY created_at DESC`,
      [promptId],
    )
    const versions = versionsResult || []

    const evaluationResult = await executeSql(`SELECT * FROM public.prompt_evaluations WHERE prompt_id = $1::uuid`, [
      promptId,
    ])
    const evaluation = evaluationResult && evaluationResult.length > 0 ? evaluationResult[0] : null

    const outputResult = await executeSql(`SELECT * FROM public.prompt_outputs WHERE prompt_id = $1::uuid`, [promptId])
    const output = outputResult && outputResult.length > 0 ? outputResult[0] : null

    const suggestionsResult = await executeSql(`SELECT * FROM public.improvement_suggestions WHERE prompt_id = $1::uuid`, [
      promptId,
    ])
    const suggestions = suggestionsResult || []
    console.log("Suggestions found:", suggestions.length, suggestions)

    return {
      success: true,
      prompt,
      versions,
      evaluation,
      output,
      suggestions,
    }
  } catch (error) {
    console.error("Error getting prompt details:", error)
    return {
      success: false,
      error: "Failed to get prompt details",
    }
  }
}

/**
 * Get public prompts with filtering
 * @param page Page number
 * @param pageSize Number of items per page
 * @param industry Industry filter
 * @param minScore Minimum score filter
 * @param searchTerm Search term filter
 * @returns Object with prompts and pagination info
 */
export async function getFilteredPrompts(
  page = 1,
  pageSize = 10,
  industry?: string,
  minScore?: number,
  searchTerm?: string,
) {
  try {
    const offset = (page - 1) * pageSize

    // Build the query with version information
    let query = `
      SELECT p.*,
             COALESCE(latest_v.version_number, 1) as current_version,
             latest_v.version_number as latest_version_number
      FROM public.prompts p
      LEFT JOIN (
        SELECT pv.prompt_id, 
               MAX(pv.version_number) as version_number
        FROM public.prompt_versions pv
        GROUP BY pv.prompt_id
      ) latest_v ON p.id = latest_v.prompt_id
      WHERE p.is_public = true`
    
    const params: any[] = []

    if (industry) {
      params.push(industry)
      query += ` AND p.industry = $${params.length}`
    }

    if (minScore) {
      params.push(minScore)
      query += ` AND p.score >= $${params.length}`
    }

    if (searchTerm) {
      params.push(`%${searchTerm}%`)
      query += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`
    }

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_prompts`
    const countResult = await executeSql(countQuery, params)
    const total = Number.parseInt(countResult[0]?.total || "0")

    // Get paginated results
    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)

    const promptsResult = await executeSql(query, params)
    const prompts = promptsResult || []

    return {
      success: true,
      prompts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error("Error getting filtered prompts:", error)
    return {
      success: false,
      error: "Failed to get prompts",
    }
  }
}

/**
 * Get user prompts
 * @param userId User ID
 * @param page Page number
 * @param pageSize Number of items per page
 * @returns Object with prompts and pagination info
 */
export async function getUserPrompts(userId: string, page = 1, pageSize = 10) {
  try {
    const offset = (page - 1) * pageSize

    // Count total
    const countResult = await executeSql(`SELECT COUNT(*) as total FROM public.prompts WHERE user_id = $1`, [userId])
    const total = Number.parseInt(countResult[0]?.total || "0")

    // Get paginated results
    const promptsResult = await executeSql(
      `SELECT * FROM public.prompts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset],
    )
    const prompts = promptsResult || []

    return {
      success: true,
      prompts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error("Error getting user prompts:", error)
    return {
      success: false,
      error: "Failed to get user prompts",
    }
  }
}

/**
 * Get user favorite prompts
 * @param userId User ID
 * @param page Page number
 * @param pageSize Number of items per page
 * @returns Object with prompts and pagination info
 */
export async function getUserFavorites(userId: string, page = 1, pageSize = 10) {
  try {
    const offset = (page - 1) * pageSize

    // Count total
    const countResult = await executeSql(
      `SELECT COUNT(*) as total FROM public.favorites f
       JOIN public.prompts p ON f.prompt_id = p.id
       WHERE f.user_id = $1`,
      [userId],
    )
    const total = Number.parseInt(countResult[0]?.total || "0")

    // Get paginated results
    const promptsResult = await executeSql(
      `SELECT p.* FROM public.favorites f
       JOIN public.prompts p ON f.prompt_id = p.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset],
    )
    const prompts = promptsResult || []

    return {
      success: true,
      prompts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error("Error getting user favorites:", error)
    return {
      success: false,
      error: "Failed to get user favorites",
    }
  }
}

/**
 * Toggle favorite status
 * @param userId User ID
 * @param promptId Prompt ID
 * @returns Object with success status and whether the prompt was added or removed
 */
export async function togglePromptFavorite(userId: string, promptId: string) {
  try {
    // Check if already favorited
    const existingResult = await executeSql(`SELECT id FROM public.favorites WHERE user_id = $1 AND prompt_id = $2::uuid`, [
      userId,
      promptId,
    ])
    const alreadyFavorited = existingResult && existingResult.length > 0

    if (alreadyFavorited) {
      // Remove from favorites
      await executeSql(`DELETE FROM public.favorites WHERE user_id = $1 AND prompt_id = $2::uuid`, [userId, promptId])
      return {
        success: true,
        added: false,
      }
    } else {
      // Add to favorites
      await executeSql(
        `INSERT INTO public.favorites (user_id, prompt_id, created_at)
         VALUES ($1, $2::uuid, NOW())`,
        [userId, promptId],
      )
      return {
        success: true,
        added: true,
      }
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return {
      success: false,
      error: "Failed to toggle favorite",
    }
  }
}

/**
 * Check if a prompt is favorited by a user
 * @param userId User ID
 * @param promptId Prompt ID
 * @returns Object with success status and whether the prompt is favorited
 */
export async function checkPromptFavorite(userId: string, promptId: string) {
  try {
    const result = await executeSql(`SELECT id FROM public.favorites WHERE user_id = $1 AND prompt_id = $2::uuid`, [
      userId,
      promptId,
    ])
    const isFavorited = result && result.length > 0

    return {
      success: true,
      isFavorited,
    }
  } catch (error) {
    console.error("Error checking favorite status:", error)
    return {
      success: false,
      error: "Failed to check favorite status",
    }
  }
}

/**
 * Update a prompt
 * @param formData Form data containing prompt information
 * @returns Object with success status and prompt ID or error message
 */
export async function updateExistingPrompt(formData: FormData) {
  try {
    const promptId = formData.get("promptId") as string
    const title = formData.get("title") as string
    const promptText = formData.get("promptText") as string
    const description = (formData.get("description") as string) || undefined
    const industry = (formData.get("industry") as string) || undefined
    const isPublic = formData.get("isPublic") === "true"

    // Validate required fields
    if (!promptId || !title || !promptText) {
      return {
        success: false,
        error: "Prompt ID, title, and prompt text are required",
      }
    }

    // Get the current prompt
    const currentPromptResult = await executeSql(`SELECT * FROM public.prompts WHERE id = $1::uuid`, [promptId])

    if (!currentPromptResult || currentPromptResult.length === 0) {
      return {
        success: false,
        error: "Prompt not found",
      }
    }

    const currentPrompt = currentPromptResult[0]

    // Check if the prompt text has changed
    const textChanged = currentPrompt.prompt_text !== promptText

    // Update the prompt
    await executeSql(
      `UPDATE public.prompts
       SET title = $1, description = $2, industry = $3, is_public = $4, prompt_text = $5, updated_at = NOW()
       WHERE id = $6::uuid`,
      [title, description, industry, isPublic, promptText, promptId],
    )

    // If the prompt text changed, create a new version
    if (textChanged) {
      // Get the highest version number for this prompt
      const versionResult = await executeSql(
        `SELECT MAX(version_number) as max_version FROM public.prompt_versions WHERE prompt_id = $1::uuid`,
        [promptId]
      );
      
      // Get the next version number (default to 1 if no versions exist)
      const nextVersion = versionResult[0]?.max_version ? Number(versionResult[0].max_version) + 1 : 1;
      
      // Create a new version with incremented version number
      await executeSql(
        `INSERT INTO public.prompt_versions (prompt_id, version_number, prompt_text, score, created_at)
         VALUES ($1::uuid, $2, $3, $4, NOW())`,
        [promptId, nextVersion, promptText, currentPrompt.score],
      )

      // In a real implementation, we might re-evaluate the prompt here
    }

    revalidatePath("/prompts")
    revalidatePath("/dashboard")
    revalidatePath(`/prompt/${promptId}`)

    return {
      success: true,
      promptId,
    }
  } catch (error) {
    console.error("Error updating prompt:", error)
    return {
      success: false,
      error: "Failed to update prompt",
    }
  }
}

/**
 * Delete a prompt
 * @param promptId Prompt ID
 * @returns Object with success status or error message
 */
export async function deleteExistingPrompt(promptId: string) {
  try {
    // Check if prompt exists
    const promptResult = await executeSql(`SELECT id FROM public.prompts WHERE id = $1::uuid`, [promptId])

    if (!promptResult || promptResult.length === 0) {
      return {
        success: false,
        error: "Prompt not found",
      }
    }

    // Delete the prompt (cascade should handle related records)
    await executeSql(`DELETE FROM public.prompts WHERE id = $1::uuid`, [promptId])

    revalidatePath("/prompts")
    revalidatePath("/dashboard")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting prompt:", error)
    return {
      success: false,
      error: "Failed to delete prompt",
    }
  }
}

/**
 * Increment impressions for a prompt
 * @param promptId Prompt ID
 * @returns Object with success status or error message
 */
export async function incrementImpressions(promptId: string) {
  try {
    await executeSql(`UPDATE public.prompts SET impressions = impressions + 1 WHERE id = $1::uuid`, [promptId])
    return {
      success: true,
    }
  } catch (error) {
    console.error("Error incrementing impressions:", error)
    return {
      success: false,
      error: "Failed to increment impressions",
    }
  }
}

// Simplified fallback function that uses AI for everything
async function generatePromptMetadata(promptText: string, userCountry?: string) {
  try {
    // Use AI for all metadata generation
    const metadata = await generatePromptMetadataAI(promptText, userCountry)
    
    return {
      title: metadata.title,
      description: metadata.description,
      industry: metadata.industry,
    }
  } catch (error) {
    console.error("Error in AI metadata generation, using basic fallback:", error)
    
    // Ultimate fallback - very basic extraction
    let title = promptText.split(" ").slice(0, 5).join(" ")
    if (title.length < 20 && promptText.length > 20) {
      title = promptText.split(" ").slice(0, 10).join(" ")
    }
    if (title.length < promptText.length) {
      title += "..."
    }
    title = title.charAt(0).toUpperCase() + title.slice(1)

    return {
      title,
      description: "Provides instructions and guidance for generating high-quality content tailored to specific requirements.",
      industry: "General", // Default to General if AI fails
    }
  }
}

// New function for AI-powered metadata generation
async function generatePromptMetadataAI_Local(promptText: string, userCountry?: string) {
  try {
    // Generate title, description, and industry using AI with locale context
    const metadata = await generatePromptMetadataAI(promptText, userCountry)
    
    return {
      title: metadata.title,
      description: metadata.description,
      industry: metadata.industry,
    }
  } catch (error) {
    console.error("Error generating AI metadata, falling back to basic method:", error)
    // Fallback to the original basic method
    return generatePromptMetadata(promptText, userCountry)
  }
}

// Helper functions for simulation (to be replaced with actual AI service)
function simulateEvaluation(promptText: string) {
  // Modern prompt evaluation based on structured prompt principles
  const length = promptText.length
  const wordCount = promptText.split(/\s+/).length
  const lines = promptText.split('\n')

  // Check for modern structured prompt elements
  const hasIdentitySection = /^#\s*Identity/mi.test(promptText) || promptText.includes("You are")
  const hasInstructionsSection = /^#\s*Instructions/mi.test(promptText) || promptText.includes("* ")
  const hasExamplesSection = /^#\s*Examples/mi.test(promptText) || promptText.includes("<user_query>")
  const hasStructuredSections = /^#\s+/m.test(promptText) // Any markdown headers
  const hasBulletPoints = promptText.includes("* ") || promptText.includes("- ")
  const hasConstraints = promptText.includes("Do not") || promptText.includes("instead of")

  // CLARITY SCORING (90-100 for excellent structure)
  let clarity = 70 // Base score
  if (hasIdentitySection) clarity += 15 // Clear role definition
  if (hasInstructionsSection) clarity += 10 // Clear instructions
  if (hasStructuredSections) clarity += 10 // Good organization
  if (hasBulletPoints) clarity += 5 // Easy to read format
  clarity = Math.min(100, Math.max(60, clarity))

  // SPECIFICITY SCORING (90-100 for detailed instructions)
  let specificity = 70 // Base score
  if (hasBulletPoints) specificity += 15 // Specific bullet points
  if (hasConstraints) specificity += 10 // Clear constraints
  if (wordCount > 100) specificity += 10 // Detailed content
  if (hasExamplesSection) specificity += 5 // Examples provided
  specificity = Math.min(100, Math.max(60, specificity))

  // CONTEXTUAL SCORING (90-100 for good context)
  let contextual = 70 // Base score
  if (hasIdentitySection) contextual += 15 // Role context
  if (hasExamplesSection) contextual += 10 // Example context
  if (length > 200) contextual += 10 // Sufficient detail
  if (hasConstraints) contextual += 5 // Behavioral context
  contextual = Math.min(100, Math.max(60, contextual))

  // EFFECTIVENESS SCORING (90-100 for well-structured prompts)
  let effectiveness = 75 // Base score
  if (hasIdentitySection && hasInstructionsSection) effectiveness += 15 // Complete structure
  if (hasStructuredSections) effectiveness += 10 // Professional format
  if (clarity > 85 && specificity > 85) effectiveness += 5 // High quality overall
  effectiveness = Math.min(100, Math.max(65, effectiveness))

  // Generate modern feedback based on structured prompt principles
  const feedback = []

  // Clarity feedback
  if (clarity > 85) {
    feedback.push({
      category: "Strength",
      message: "Excellent structure with clear sections and role definition. Very easy to understand.",
    })
  } else if (hasStructuredSections) {
    feedback.push({
      category: "Strength", 
      message: "Good use of structured sections makes the prompt clear and organized.",
    })
  } else {
    feedback.push({
      category: "Improvement",
      message: "Consider using structured sections (# Identity, # Instructions) for better clarity.",
      priority: "medium"
    })
  }

  // Specificity feedback
  if (specificity > 85) {
    feedback.push({
      category: "Strength",
      message: "Excellent specificity with detailed instructions and clear constraints.",
    })
  } else if (!hasBulletPoints) {
    feedback.push({
      category: "Improvement",
      message: "Use bullet points (* or -) to make instructions more specific and actionable.",
      priority: "medium"
    })
  }

  // Contextual feedback
  if (contextual > 85) {
    feedback.push({
      category: "Strength",
      message: "Great context provided with clear role definition and examples.",
    })
  } else if (!hasIdentitySection) {
    feedback.push({
      category: "Improvement",
      message: "Add an Identity section to clearly define the AI's role (e.g., 'You are an expert marketing copywriter').",
      priority: "high"
    })
  }

  // Effectiveness feedback
  if (effectiveness > 85) {
    feedback.push({
      category: "Strength",
      message: "Highly effective prompt structure that should produce consistent, quality results.",
    })
  } else if (!hasInstructionsSection) {
    feedback.push({
      category: "Improvement", 
      message: "Add a dedicated Instructions section with specific, actionable guidance.",
      priority: "high"
    })
  }

  return {
    clarity,
    specificity,
    contextual,
    effectiveness,
    feedback,
  }
}

async function simulateOutput(promptText: string) {
  // Add a small delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // This is a placeholder for the actual AI output generation
  // In a real implementation, this would call an AI service

  return `This is a simulated response to your prompt: "${promptText.substring(0, 50)}..."

In a real implementation, this would be generated by an AI model based on your prompt. The response would be tailored to the specific instructions, examples, and context you provided in your prompt.`
}

async function simulateSuggestions(promptText: string) {
  // Add a small delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // This is a placeholder for the actual AI suggestion generation
  // In a real implementation, this would call an AI service

  const suggestions = []

  // Check for identity section
  if (!promptText.toLowerCase().includes("you are") && !promptText.toLowerCase().includes("as a")) {
    suggestions.push({
      section: "identity",
      priority: "high",
      suggestion:
        'Add an identity section that defines who or what the AI should be (e.g., "You are an expert marketing copywriter").',
    })
  }

  // Check for examples
  if (!promptText.toLowerCase().includes("example") && !promptText.toLowerCase().includes("for instance")) {
    suggestions.push({
      section: "examples",
      priority: "medium",
      suggestion: "Include examples of desired outputs to better guide the AI response.",
    })
  }

  // Check for context
  if (!promptText.toLowerCase().includes("context") && promptText.length < 200) {
    suggestions.push({
      section: "context",
      priority: "medium",
      suggestion: "Add more context or background information to help the AI understand the task better.",
    })
  }

  // Check for specific instructions
  if (!promptText.includes("should") && !promptText.includes("must")) {
    suggestions.push({
      section: "instructions",
      priority: "high",
      suggestion:
        'Include specific instructions using words like "should" or "must" to clearly communicate requirements.',
    })
  }

  // Always add a general improvement suggestion
  suggestions.push({
    section: "general",
    priority: "low",
    suggestion:
      "Consider structuring your prompt with clear sections for identity, instructions, examples, and context.",
  })

  return suggestions
}

// Export the functions
export async function getPrompt(id: string) {
  try {
    const result = await executeQuery(`SELECT * FROM public.prompts WHERE id = '${id}'`)
    return result
  } catch (error) {
    console.error("Error fetching prompt:", error)
    return null
  }
}

export async function createPrompt(promptText: string) {
  try {
    const result = await executeSql(`INSERT INTO public.prompts (text) VALUES ('${promptText}')`)
    return result
  } catch (error) {
    console.error("Error creating prompt:", error)
    return null
  }
}

/**
 * Improve an existing prompt instantly (create version or fork) and process async
 * @param formData Form data containing improvement information
 * @returns Object with success status and prompt ID for immediate redirect
 */
export async function improvePromptInstant(formData: FormData) {
  try {
    console.log("🚨 BACKEND DEBUG: improvePromptInstant function called!")
    
    const originalPromptId = formData.get("originalPromptId") as string
    const improvedPromptText = formData.get("improvedPromptText") as string
    const improvementNotes = formData.get("improvementNotes") as string
    const userId = formData.get("userId") as string
    const actionType = formData.get("actionType") as string // "version" or "fork"
    const appliedSuggestions = formData.get("appliedSuggestions") as string
    const isImprovementFlag = formData.get("isImprovement") === "true"
    
    console.log("🚨 BACKEND DEBUG: Raw form data values:", {
      originalPromptId,
      actionType,
      userId,
      isImprovementRaw: formData.get("isImprovement"),
      isImprovementFlag,
      improvementNotes
    })

    // Validate required fields
    if (!originalPromptId || !improvedPromptText || !userId) {
      return {
        success: false,
        error: "Missing required fields",
      }
    }

    console.log("Improving prompt instantly:", {
      originalPromptId,
      actionType,
      userId,
      improvedPromptText: improvedPromptText.substring(0, 50) + "...",
      isImprovementFlag,
      improvementNotes: improvementNotes ? improvementNotes.substring(0, 50) + "..." : "empty",
      appliedSuggestions: appliedSuggestions ? "provided" : "none"
    })

    console.log("🔍 FORK DEBUG: Full improved prompt text being used:", improvedPromptText)
    console.log("🔍 FORK DEBUG: Improved prompt text length:", improvedPromptText.length)
    console.log("🔍 FORK DEBUG: Raw isImprovement value:", formData.get("isImprovement"))
    console.log("🔍 FORK DEBUG: Parsed isImprovement flag:", isImprovementFlag)

    // Get the original prompt
    const originalPromptResult = await executeSql(
      `SELECT * FROM public.prompts WHERE id = $1::uuid`,
      [originalPromptId]
    )

    if (!originalPromptResult || originalPromptResult.length === 0) {
      return {
        success: false,
        error: "Original prompt not found",
      }
    }

    const originalPrompt = originalPromptResult[0]
    const isOwner = originalPrompt.user_id === userId

    // Generate improved prompt if suggestions or improvements are provided
    let finalPromptText = improvedPromptText
    if (isImprovementFlag && (appliedSuggestions || improvementNotes)) {
      try {
        console.log("🔧 Generating improved prompt with AI...")
        finalPromptText = await generateImprovedPrompt(
          improvedPromptText, // original prompt text
          appliedSuggestions ? JSON.parse(appliedSuggestions) : [],
          improvementNotes
        )
        console.log("🔧 Generated improved prompt length:", finalPromptText.length)
      } catch (error) {
        console.error("Error generating improved prompt:", error)
        // Fall back to original text if improvement fails
        finalPromptText = improvedPromptText
      }
    }

    console.log("🔍 FORK DEBUG: Original prompt details:", {
      id: originalPrompt.id,
      title: originalPrompt.title,
      score: originalPrompt.score,
      prompt_text_preview: originalPrompt.prompt_text.substring(0, 200) + "...",
      prompt_text_length: originalPrompt.prompt_text.length
    })

    console.log("🔍 FORK DEBUG: Comparison:")
    console.log("🔍 FORK DEBUG: Original prompt text length:", originalPrompt.prompt_text.length)
    console.log("🔍 FORK DEBUG: Final prompt text length:", finalPromptText.length)
    console.log("🔍 FORK DEBUG: Original prompt text (first 100 chars):", originalPrompt.prompt_text.substring(0, 100))
    console.log("🔍 FORK DEBUG: Final prompt text (first 100 chars):", finalPromptText.substring(0, 100))
    console.log("🔍 FORK DEBUG: Are they exactly the same?", originalPrompt.prompt_text === finalPromptText)
    console.log("🔍 FORK DEBUG: Are they the same after trim?", originalPrompt.prompt_text.trim() === finalPromptText.trim())
    
    // Determine if this is a simple copy or an improvement
    // For non-owners: simple copy = same text + no improvement flag + fork action
    // Use trimmed comparison to handle whitespace differences
    const isSimpleCopy = !isOwner && actionType === "fork" && originalPrompt.prompt_text.trim() === finalPromptText.trim() && !isImprovementFlag
    
    // FORCE simple copy if no improvements were made (extra safety check)
    const forceSimpleCopy = !isOwner && actionType === "fork" && !isImprovementFlag && (!improvementNotes || improvementNotes.trim() === "")
    const finalIsSimpleCopy = isSimpleCopy || forceSimpleCopy
    console.log("🔍 FORK DEBUG: Simple copy conditions:")
    console.log("🔍 FORK DEBUG: - Not owner:", !isOwner)
    console.log("🔍 FORK DEBUG: - Action is fork:", actionType === "fork")
    console.log("🔍 FORK DEBUG: - Text matches (trimmed):", originalPrompt.prompt_text.trim() === finalPromptText.trim())
    console.log("🔍 FORK DEBUG: - No improvement flag:", !isImprovementFlag)
    console.log("🔍 FORK DEBUG: - No improvement notes:", !improvementNotes || improvementNotes.trim() === "")
    console.log("🔍 FORK DEBUG: Is simple copy (text match):", isSimpleCopy)
    console.log("🔍 FORK DEBUG: Force simple copy (no improvements):", forceSimpleCopy)
    console.log("🔍 FORK DEBUG: FINAL: Is simple copy (no evaluation needed)?", finalIsSimpleCopy)
    console.log("🔍 FORK DEBUG: Improvement flag from client:", isImprovementFlag)
    console.log("🔍 FORK DEBUG: Is owner:", isOwner)
    console.log("🔍 FORK DEBUG: Action type:", actionType)

    // Validate action type matches ownership
    if (actionType === "version" && !isOwner) {
      return {
        success: false,
        error: "You can only create versions of your own prompts",
      }
    }

    let promptId: string

    if (actionType === "version" && isOwner) {
      // Create a new version of the existing prompt
      console.log("Creating new version for owned prompt instantly")

      // Get the highest version number for this prompt
      const versionResult = await executeSql(
        `SELECT MAX(version_number) as max_version FROM public.prompt_versions WHERE prompt_id = $1::uuid`,
        [originalPromptId]
      )

      const nextVersion = (versionResult?.[0]?.max_version || 0) + 1

      // Update the main prompt with new content immediately (score will be updated async)
      await executeSql(
        `UPDATE public.prompts 
         SET prompt_text = $1, score = 0, updated_at = NOW()
         WHERE id = $2::uuid`,
        [finalPromptText, originalPromptId]
      )

      // Create new version entry immediately
      await executeSql(
        `INSERT INTO public.prompt_versions (prompt_id, version_number, prompt_text, score, created_at)
         VALUES ($1::uuid, $2, $3, $4, NOW())`,
        [originalPromptId, nextVersion, finalPromptText, 0]
      )

      // Clear existing sections to trigger processing banner
      await Promise.all([
        // Clear evaluation temporarily (set score to 0)
        executeSql(
          `UPDATE public.prompt_evaluations 
           SET clarity_score = 0, specificity_score = 0, contextual_score = 0, 
               effectiveness_score = 0, feedback = '[]'::jsonb
           WHERE prompt_id = $1::uuid`,
          [originalPromptId]
        ),
        // Clear output temporarily  
        executeSql(
          `UPDATE public.prompt_outputs 
           SET output_text = '' 
           WHERE prompt_id = $1::uuid`,
          [originalPromptId]
        ),
        // Clear suggestions temporarily
        executeSql(
          `DELETE FROM public.improvement_suggestions WHERE prompt_id = $1::uuid`,
          [originalPromptId]
        )
      ])

      promptId = originalPromptId

      // Start async processing for the updated prompt
      processPromptVersionAsync(originalPromptId, finalPromptText, nextVersion).catch((error) => {
        console.error("Error in version async processing:", error)
      })

      return {
        success: true,
        promptId: originalPromptId,
        message: `Version ${nextVersion} created successfully`,
      }

    } else {
      // Create a new prompt (fork) for non-owners
      console.log("Creating fork for non-owner instantly")

      // Generate metadata for the new prompt
      let title, description
      if (finalIsSimpleCopy) {
        // For simple copies, use simpler naming
        title = originalPrompt.title
        description = improvementNotes || originalPrompt.title
      } else {
        // For improvements, generate better metadata
        try {
          // Get user's country for locale-aware metadata
          let userCountry: string | undefined
          try {
            const { getCurrentUser } = await import("@/app/actions/auth-actions")
            const user = await getCurrentUser()
            userCountry = user?.country
          } catch (error) {
            console.error("Error getting user country for fork:", error)
          }
          
          const generatedMetadata = await generatePromptMetadataAI_Local(finalPromptText, userCountry)
          title = generatedMetadata.title
          description = improvementNotes || generatedMetadata.description || originalPrompt.description || originalPrompt.title
        } catch (error) {
          console.error("Error generating AI metadata for fork, using fallback:", error)
          title = originalPrompt.title
          description = improvementNotes || originalPrompt.description || originalPrompt.title
        }
      }

      // Create the new prompt immediately
      // For simple copies, preserve the original score; for improvements, start with 0 and re-evaluate
      const initialScore = finalIsSimpleCopy ? originalPrompt.score : 0
      
      const insertResult = await executeSql(
        `INSERT INTO public.prompts (title, prompt_text, description, industry, is_public, user_id, created_at, updated_at, score)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
         RETURNING id`,
        [title, finalPromptText, description, originalPrompt.industry, false, userId, initialScore],
      )

      if (!insertResult || insertResult.length === 0 || !insertResult[0].id) {
        throw new Error("Failed to create improved prompt")
      }

      promptId = insertResult[0].id

      // Create the first version immediately
      await executeSql(
        `INSERT INTO public.prompt_versions (prompt_id, version_number, prompt_text, score, created_at)
         VALUES ($1::uuid, 1, $2, $3, NOW())`,
        [promptId, finalPromptText, initialScore],
      )

      if (finalIsSimpleCopy) {
        // For simple copies, copy all the existing data without re-evaluation
        console.log("🔄 SIMPLE COPY: Copying existing evaluation data without re-processing")
        
        try {
          // Copy evaluation if it exists
          const evalResult = await executeSql(
            `SELECT * FROM public.prompt_evaluations WHERE prompt_id = $1::uuid LIMIT 1`,
            [originalPromptId]
          )
          
          if (evalResult && evalResult.length > 0) {
            const evaluation = evalResult[0]
            await executeSql(
              `INSERT INTO public.prompt_evaluations (prompt_id, clarity_score, specificity_score, contextual_score, effectiveness_score, feedback, created_at)
               VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, NOW())`,
              [promptId, evaluation.clarity_score, evaluation.specificity_score, evaluation.contextual_score, evaluation.effectiveness_score, evaluation.feedback]
            )
            console.log("✅ SIMPLE COPY: Evaluation copied")
          }

          // Copy output if it exists
          const outputResult = await executeSql(
            `SELECT * FROM public.prompt_outputs WHERE prompt_id = $1::uuid LIMIT 1`,
            [originalPromptId]
          )
          
          if (outputResult && outputResult.length > 0) {
            await executeSql(
              `INSERT INTO public.prompt_outputs (prompt_id, output_text, created_at)
               VALUES ($1::uuid, $2, NOW())`,
              [promptId, outputResult[0].output_text]
            )
            console.log("✅ SIMPLE COPY: Output copied")
          }

          // Copy improvement suggestions if they exist
          const suggestionsResult = await executeSql(
            `SELECT * FROM public.improvement_suggestions WHERE prompt_id = $1::uuid`,
            [originalPromptId]
          )
          
          if (suggestionsResult && suggestionsResult.length > 0) {
            const insertPromises = suggestionsResult.map(suggestion =>
              executeSql(
                `INSERT INTO public.improvement_suggestions (prompt_id, section, priority, suggestion, created_at)
                 VALUES ($1::uuid, $2, $3, $4, NOW())`,
                [promptId, suggestion.section, suggestion.priority, suggestion.suggestion]
              )
            )
            
            await Promise.all(insertPromises)
            console.log(`✅ SIMPLE COPY: ${suggestionsResult.length} suggestions copied`)
          }
          
          console.log("✅ SIMPLE COPY: All data copied successfully - NO EVALUATION TRIGGERED")
        } catch (copyError) {
          console.error("❌ SIMPLE COPY: Error copying data:", copyError)
          // If copying fails, fall back to evaluation
          processPromptAsync(promptId, finalPromptText).catch((error) => {
            console.error("Error in fallback async processing:", error)
          })
        }
      } else {
        // For improvements, start async processing for re-evaluation
        console.log("🔄 IMPROVEMENT: Starting async processing for re-evaluation")
        processPromptAsync(promptId, finalPromptText).catch((error) => {
          console.error("Error in fork async processing:", error)
        })
      }

      return {
        success: true,
        promptId: promptId,
        message: finalIsSimpleCopy ? "Prompt copied successfully" : "Improved prompt created successfully",
      }
    }

  } catch (error) {
    console.error("Error improving prompt instantly:", error)
    return {
      success: false,
      error: "Failed to improve prompt",
    }
  }
}

/**
 * Process prompt version updates asynchronously (for existing prompts)
 * @param promptId The UUID of the prompt to update
 * @param promptText The text of the improved prompt
 * @param versionNumber The version number being created
 */
async function processPromptVersionAsync(promptId: string, promptText: string, versionNumber: number) {
  try {
    console.log("Starting async processing for prompt version:", promptId, "v" + versionNumber)

    // Helper function to add timeout to promises
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
        )
      ])
    }

    // Process all sections in parallel with timeout protection
    const [evaluationResult, outputResult] = await Promise.allSettled([
      // Process evaluation with timeout
      withTimeout(
        (async () => {
          try {
            const analysis = await analyzePrompt(promptText)
            const overallScore = ensureInteger(analysis.overall_score)

            // Create new evaluation record (since records were deleted in version creation)
            await executeSql(
              `INSERT INTO public.prompt_evaluations (prompt_id, clarity_score, specificity_score, contextual_score, effectiveness_score, feedback, created_at)
               VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, NOW())`,
              [
                promptId,
                ensureInteger(analysis.clarity_score),
                ensureInteger(analysis.specificity_score),
                ensureInteger(analysis.contextual_score),
                ensureInteger(analysis.effectiveness_score),
                JSON.stringify(analysis.feedback),
              ]
            )

            // Update prompt and version scores
            await Promise.all([
              executeSql(`UPDATE public.prompts SET score = $1 WHERE id = $2::uuid`, [overallScore, promptId]),
              executeSql(
                `UPDATE public.prompt_versions SET score = $1 WHERE prompt_id = $2::uuid AND version_number = $3`,
                [overallScore, promptId, versionNumber]
              )
            ])

            return overallScore
          } catch (evalError) {
            console.error("Error in version evaluation, falling back to simulation:", evalError)
            const evaluationScores = simulateEvaluation(promptText)
            const overallScore = Math.round(
              (evaluationScores.clarity + evaluationScores.specificity + evaluationScores.contextual + evaluationScores.effectiveness) / 4
            )

            // Create new evaluation record (simulation fallback)
            await executeSql(
              `INSERT INTO public.prompt_evaluations (prompt_id, clarity_score, specificity_score, contextual_score, effectiveness_score, feedback, created_at)
               VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, NOW())`,
              [
                promptId,
                evaluationScores.clarity,
                evaluationScores.specificity,
                evaluationScores.contextual,
                evaluationScores.effectiveness,
                JSON.stringify(evaluationScores.feedback),
              ]
            )

            await Promise.all([
              executeSql(`UPDATE public.prompts SET score = $1 WHERE id = $2::uuid`, [overallScore, promptId]),
              executeSql(
                `UPDATE public.prompt_versions SET score = $1 WHERE prompt_id = $2::uuid AND version_number = $3`,
                [overallScore, promptId, versionNumber]
              )
            ])

            return overallScore
          }
        })(),
        60000, // 60 seconds timeout for evaluation
        "Version evaluation process timed out after 60 seconds"
      ),

      // Process output generation with timeout
      withTimeout(
        (async () => {
          try {
            const outputResult = await generatePromptOutput(promptText)
            
            // Create new output record (since records were deleted in version creation)
            await executeSql(
              `INSERT INTO public.prompt_outputs (prompt_id, output_text, created_at)
               VALUES ($1::uuid, $2, NOW())`,
              [promptId, outputResult.output_text]
            )

            return outputResult.output_text
          } catch (outputError) {
            console.error("Error generating version output, falling back to simulation:", outputError)
            const simulatedOutput = await simulateOutput(promptText)
            
            // Create new output record (simulation fallback)
            await executeSql(
              `INSERT INTO public.prompt_outputs (prompt_id, output_text, created_at)
               VALUES ($1::uuid, $2, NOW())`,
              [promptId, simulatedOutput]
            )

            return simulatedOutput
          }
        })(),
        75000, // 75 seconds timeout for output generation
        "Version output generation process timed out after 75 seconds"
      ),
    ])

    console.log("Version processing completed for prompt:", promptId, "v" + versionNumber)
    
    // Log any timeout errors
    if (evaluationResult.status === 'rejected') {
      console.error("Version evaluation failed:", evaluationResult.reason)
    }
    if (outputResult.status === 'rejected') {
      console.error("Version output generation failed:", outputResult.reason)
    }
    
  } catch (error) {
    console.error("Error in version async processing:", error)
  }
}

/**
 * Transform user input into a proper prompt format
 * @param userInput User's description of what they want to create
 * @param userCountry User's country for locale-aware prompts (optional)
 * @returns A properly formatted prompt
 */
export async function transformInputToPrompt(userInput: string, userCountry?: string): Promise<string> {
  // Simple context-aware prompt generation
  const input = userInput.toLowerCase()
  
  // Determine role/identity and specific instructions based on context
  let identity = 'You are a professional writer'
  let instructions = []
  let variables = '{{name}}, {{company}}, {{topic}}'
  
  // Academic/Education
  if (input.includes('professor') || input.includes('academic') || input.includes('research')) {
    identity = 'You are an expert in academic communication'
    variables = '{{student_name}}, {{professor_name}}, {{research_area}}'
    instructions = [
      'Use formal academic tone and proper titles',
      'Demonstrate knowledge of the professor\'s research area',
      'Include clear purpose and maintain respectful tone'
    ]
  }
  // Marketing & Digital Marketing
  else if (input.includes('marketing') || input.includes('campaign') || input.includes('advertisement')) {
    identity = 'You are an expert marketing strategist'
    variables = '{{target_audience}}, {{product_name}}, {{campaign_goal}}'
    instructions = [
      'Create compelling copy that drives action',
      'Use persuasive language and clear value propositions',
      'Include strong call-to-action and urgency when appropriate'
    ]
  }
  // Sales
  else if (input.includes('sales') || input.includes('pitch') || input.includes('proposal')) {
    identity = 'You are a seasoned sales professional'
    variables = '{{prospect_name}}, {{product_service}}, {{pain_point}}'
    instructions = [
      'Address specific customer pain points and needs',
      'Highlight key benefits with concrete examples',
      'Include social proof and clear next steps'
    ]
  }
  // Customer Service
  else if (input.includes('customer') || input.includes('support') || input.includes('complaint')) {
    identity = 'You are an experienced customer service specialist'
    variables = '{{customer_name}}, {{issue_type}}, {{company_name}}'
    instructions = [
      'Acknowledge concerns with empathy and understanding',
      'Provide clear, step-by-step solutions',
      'Maintain helpful tone and include follow-up information'
    ]
  }
  // Technology/Code
  else if (input.includes('code') || input.includes('technical') || input.includes('software')) {
    identity = 'You are a senior software engineer'
    variables = '{{developer_name}}, {{technology}}, {{feature_name}}'
    instructions = [
      'Use precise technical language and best practices',
      'Provide specific examples and clear explanations',
      'Include security and performance considerations'
    ]
  }
  // Healthcare
  else if (input.includes('medical') || input.includes('health') || input.includes('patient')) {
    identity = 'You are a healthcare communication specialist'
    variables = '{{patient_name}}, {{condition}}, {{treatment}}'
    instructions = [
      'Use clear, compassionate language avoiding medical jargon',
      'Provide accurate information with appropriate disclaimers',
      'Maintain professional and reassuring tone'
    ]
  }
  // Legal
  else if (input.includes('legal') || input.includes('contract') || input.includes('agreement')) {
    identity = 'You are a legal communication expert'
    variables = '{{client_name}}, {{legal_matter}}, {{jurisdiction}}'
    instructions = [
      'Use precise legal language while remaining accessible',
      'Include necessary disclaimers and qualifications',
      'Structure content clearly with proper legal formatting'
    ]
  }
  // Finance
  else if (input.includes('financial') || input.includes('investment') || input.includes('budget')) {
    identity = 'You are a financial communication specialist'
    variables = '{{client_name}}, {{financial_product}}, {{goal}}'
    instructions = [
      'Use clear financial terminology with explanations',
      'Include relevant disclaimers and risk information',
      'Provide actionable insights and recommendations'
    ]
  }
  // Human Resources
  else if (input.includes('hr') || input.includes('employee') || input.includes('hiring')) {
    identity = 'You are an HR communication expert'
    variables = '{{employee_name}}, {{position}}, {{company_name}}'
    instructions = [
      'Use professional, inclusive language',
      'Follow employment law guidelines and best practices',
      'Maintain clear, respectful communication tone'
    ]
  }
  // Real Estate
  else if (input.includes('property') || input.includes('real estate') || input.includes('listing')) {
    identity = 'You are a real estate marketing specialist'
    variables = '{{property_type}}, {{location}}, {{price_range}}'
    instructions = [
      'Highlight key property features and benefits',
      'Use descriptive language that creates emotional appeal',
      'Include relevant market information and next steps'
    ]
  }
  // Content Creation
  else if (input.includes('blog') || input.includes('article') || input.includes('content')) {
    identity = 'You are a professional content writer and SEO specialist'
    variables = '{{topic}}, {{target_audience}}, {{main_keyword}}'
    instructions = [
      'Create SEO-optimized content with engaging headlines',
      'Structure with clear headings and scannable format',
      'Include actionable insights and strong conclusion'
    ]
  }
  // Social Media
  else if (input.includes('social') || input.includes('post') || input.includes('instagram') || input.includes('twitter')) {
    identity = 'You are a social media marketing expert'
    variables = '{{platform}}, {{brand_name}}, {{content_theme}}'
    instructions = [
      'Create platform-specific content that drives engagement',
      'Use attention-grabbing copy and relevant hashtags',
      'Include clear call-to-action for desired outcome'
    ]
  }
  // Email Communication
  else if (input.includes('email') || input.includes('message') || input.includes('correspondence')) {
    identity = 'You are a professional communication specialist'
    variables = '{{recipient_name}}, {{subject}}, {{purpose}}'
    instructions = [
      'Write clear, concise subject line and greeting',
      'Structure message logically with key points first',
      'End with clear next steps and professional closing'
    ]
  }
  // Generic fallback
  else {
    instructions = [
      'Use clear, professional language appropriate for context',
      'Structure content logically with proper formatting',
      'Include specific details and actionable information'
    ]
  }
  
  // Add locale-specific instructions if country is provided
  if (userCountry && userCountry !== "United States") {
    instructions.push(`Adapt content for ${userCountry} locale, including appropriate cultural context, business practices, and communication style`)
  }
  
  // Build the prompt with clear structure
  const instructionText = instructions.length > 0 ? `\n\n# Instructions\n\n${instructions.map(inst => `* ${inst}`).join('\n')}` : ''
  
  // Add locale context to the task if country is provided
  const localeContext = userCountry ? ` for ${userCountry} audience` : ''
  
  // Create a more specific task that actually uses the variables
  let taskText = `Generate a complete, professional ${userInput.toLowerCase()}${localeContext} that is well-structured, engaging, and ready to use.`
  
  // Add variable-specific instructions to the task
  if (variables.includes('student_name') || variables.includes('professor_name')) {
    taskText = `Write a formal academic letter from {{student_name}} to {{professor_name}} regarding {{research_area}}. The letter should be professional, respectful, and demonstrate genuine interest in the professor's work.`
  } else if (variables.includes('target_audience') || variables.includes('campaign_goal')) {
    taskText = `Create a compelling marketing message for {{product_name}} targeting {{target_audience}} with the goal of {{campaign_goal}}. Include persuasive copy and clear call-to-action.`
  } else if (variables.includes('prospect_name') || variables.includes('pain_point')) {
    taskText = `Write a personalized sales message to {{prospect_name}} about {{product_service}} that addresses their {{pain_point}} and demonstrates clear value.`
  } else if (variables.includes('customer_name') || variables.includes('issue_type')) {
    taskText = `Compose a professional customer service response to {{customer_name}} regarding their {{issue_type}} issue for {{company_name}}. Be empathetic and solution-focused.`
  } else if (variables.includes('developer_name') || variables.includes('technology')) {
    taskText = `Create technical documentation or communication for {{developer_name}} about {{technology}} and {{feature_name}}. Include clear examples and best practices.`
  } else if (variables.includes('patient_name') || variables.includes('condition')) {
    taskText = `Write a clear, compassionate healthcare communication for {{patient_name}} about {{condition}} and {{treatment}}. Use accessible language.`
  } else if (variables.includes('client_name') || variables.includes('legal_matter')) {
    taskText = `Draft a professional legal communication to {{client_name}} regarding {{legal_matter}} in {{jurisdiction}}. Include necessary disclaimers.`
  } else if (variables.includes('financial_product') || variables.includes('goal')) {
    taskText = `Create a financial communication for {{client_name}} about {{financial_product}} to help achieve {{goal}}. Include relevant disclaimers.`
  } else if (variables.includes('employee_name') || variables.includes('position')) {
    taskText = `Write an HR communication to {{employee_name}} regarding {{position}} at {{company_name}}. Maintain professional and inclusive tone.`
  } else if (variables.includes('property_type') || variables.includes('location')) {
    taskText = `Create compelling real estate marketing copy for a {{property_type}} in {{location}} within {{price_range}}. Highlight key features and benefits.`
  } else if (variables.includes('topic') || variables.includes('main_keyword')) {
    taskText = `Write engaging content about {{topic}} for {{target_audience}} optimized for {{main_keyword}}. Include clear structure and actionable insights.`
  } else if (variables.includes('platform') || variables.includes('brand_name')) {
    taskText = `Create engaging social media content for {{platform}} promoting {{brand_name}} with {{content_theme}}. Include relevant hashtags and call-to-action.`
  } else if (variables.includes('recipient_name') || variables.includes('subject')) {
    taskText = `Write a professional email to {{recipient_name}} with subject "{{subject}}" for {{purpose}}. Include clear structure and next steps.`
  } else {
    // Generic task that uses the provided variables
    const variableList = variables.split(', ').join(', ')
    taskText = `Create a professional ${userInput.toLowerCase()} using the variables ${variableList}. Ensure the content is well-structured, engaging, and ready to use${localeContext}.`
  }
  
  return `# Identity\n\n${identity}. Create a ${userInput.toLowerCase()} using the provided variables.${instructionText}\n\n# Task\n\n${taskText}`
}



/**
 * Create a prompt record immediately with improved prompt text and process async sections
 * @param formData Form data containing prompt information
 * @returns Object with success status and prompt ID for immediate redirect
 */
export async function createPromptInstant(formData: FormData) {
  try {
    const promptText = formData.get("promptText") as string
    const userId = (formData.get("userId") as string) || undefined
    const isPublic = formData.get("isPublic") === "true"
    const userInput = formData.get("userInput") as string
    const mode = formData.get("mode") as string // 'create' or 'evaluate'
    
    // Get user's country for locale-aware prompts
    let userCountry: string | undefined
    if (userId) {
      try {
        const { getCurrentUser } = await import("@/app/actions/auth-actions")
        const user = await getCurrentUser()
        userCountry = user?.country
      } catch (error) {
        console.error("Error getting user country:", error)
        // Continue without country info
      }
    }

    // Validate required fields
    if (!promptText && !userInput) {
      return {
        success: false,
        error: "Prompt text or user input is required",
      }
    }

    let finalPromptText = promptText
    let isImproved = false
    
    // Handle different modes
    if (mode === "create" && userInput && !promptText) {
      // CREATE mode: Transform user input into a basic prompt
      try {
        console.log("CREATE mode: Transforming user input:", userInput.substring(0, 50) + "...")
        console.log("User country for locale:", userCountry || "Not specified")
        finalPromptText = await transformInputToPrompt(userInput, userCountry)
        isImproved = false // No longer doing complex improvement
        console.log("Transformed prompt:", finalPromptText.substring(0, 100) + "...")
      } catch (error) {
        console.error("Error transforming user input:", error)
        // Ultimate fallback: use input as-is
        finalPromptText = userInput
      }
    } else if (mode === "evaluate" && promptText) {
      // EVALUATE mode: Use prompt exactly as provided, no improvement
      console.log("EVALUATE mode: Using prompt as-is:", promptText.substring(0, 50) + "...")
      finalPromptText = promptText
      isImproved = false
    } else if (userInput && !promptText) {
      // Legacy support: If no mode specified but have userInput, do basic transformation
      try {
        console.log("Legacy mode: Basic transformation of user input:", userInput.substring(0, 50) + "...")
        console.log("User country for locale:", userCountry || "Not specified")
        finalPromptText = await transformInputToPrompt(userInput, userCountry)
        isImproved = false
      } catch (error) {
        console.error("Error transforming user input:", error)
        finalPromptText = userInput // Ultimate fallback
        isImproved = false
      }
    }

    // Generate metadata - use AI for meaningful titles when possible
    let generatedMetadata
    try {
      generatedMetadata = await generatePromptMetadataAI_Local(finalPromptText, userCountry)
    } catch (error) {
      console.error("Error generating AI metadata, falling back to basic method:", error)
      generatedMetadata = await generatePromptMetadata(finalPromptText)
    }
    
    const title = generatedMetadata.title
    const description = generatedMetadata.description
    const industry = generatedMetadata.industry

    console.log("Creating instant prompt record:", {
      mode,
      title,
      promptText: finalPromptText.substring(0, 50) + "...",
      description,
      industry,
      isPublic,
      userId,
      wasImproved: isImproved
    })

    // Create the prompt record immediately
    const insertResult = await executeSql(
      `INSERT INTO public.prompts (title, prompt_text, description, industry, is_public, user_id, created_at, updated_at, score)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
       RETURNING id`,
      [title, finalPromptText, description, industry, isPublic, userId, 0],
    )

    if (!insertResult || insertResult.length === 0 || !insertResult[0].id) {
      throw new Error("Failed to get prompt ID from database")
    }

    const promptId = insertResult[0].id
    console.log("Successfully created instant prompt with ID:", promptId)

    // Create the first version
    await executeSql(
      `INSERT INTO public.prompt_versions (prompt_id, version_number, prompt_text, score, created_at)
       VALUES ($1::uuid, 1, $2, $3, NOW())`,
      [promptId, finalPromptText, 0],
    )

    // Start async processing (don't await - let it run in background)
    processPromptAsync(promptId, finalPromptText).catch((error) => {
      console.error("Error in async processing:", error)
    })

    return {
      success: true,
      promptId,
      message: "Prompt created successfully",
      improvedPrompt: finalPromptText,
      wasImproved: isImproved
    }
  } catch (error) {
    console.error("Error creating instant prompt:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create prompt",
    }
  }
}

/**
 * Process prompt evaluation, output, and suggestions asynchronously
 * @param promptId The UUID of the prompt to process
 * @param promptText The text of the prompt
 */
async function processPromptAsync(promptId: string, promptText: string) {
  try {
    console.log("🚀 FORK ASYNC: Starting parallel async processing for prompt:", promptId)
    console.log("🚀 FORK ASYNC: Prompt text length:", promptText.length, "characters")

    // Helper function to add timeout to promises
    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
        )
      ])
    }

    // Process all sections in parallel for faster completion with timeout protection
    const [evaluationResult, outputResult] = await Promise.allSettled([
      // Process evaluation with timeout
      withTimeout(
        (async () => {
          try {
            console.log("🔍 FORK EVALUATION: Using LangGraph AI service for prompt:", promptId)
            console.log("🔍 FORK EVALUATION: Prompt text preview:", promptText.substring(0, 200) + "...")
            console.log("🔍 FORK EVALUATION: Full prompt text being evaluated:", promptText)
            
            // Validate prompt text before evaluation
            if (!promptText || promptText.trim().length === 0) {
              throw new Error("Empty prompt text provided for evaluation")
            }
            
            // Check if we're evaluating a malformed template and fix it
            let evaluationText = promptText
            if (promptText.includes('You are a professional expert. .') || promptText.includes('Your expertise includes .')) {
              console.log("🔧 FORK EVALUATION: Detected malformed template, fixing before evaluation")
              evaluationText = promptText.replace(/You are a professional expert\. \. Your expertise includes \./g, 
                'You are a professional expert with extensive knowledge in this domain. Your expertise includes comprehensive analysis, clear communication, and practical problem-solving.')
              console.log("🔧 FORK EVALUATION: Fixed prompt text:", evaluationText)
            }
            
            const analysis = await analyzePrompt(evaluationText)

            const clarityScore = ensureInteger(analysis.clarity_score)
            const specificityScore = ensureInteger(analysis.specificity_score)
            const contextualScore = ensureInteger(analysis.contextual_score)
            const effectivenessScore = ensureInteger(analysis.effectiveness_score)
            const overallScore = ensureInteger(analysis.overall_score)

            console.log("🔍 FORK EVALUATION: LangGraph scores:", {
              clarity: clarityScore,
              specificity: specificityScore,
              contextual: contextualScore,
              effectiveness: effectivenessScore,
              overall: overallScore
            })
            console.log("🔍 FORK EVALUATION: Raw analysis result:", analysis)

            // Create new evaluation record
            // First delete any existing evaluation to prevent conflicts
            await executeSql(
              `DELETE FROM public.prompt_evaluations WHERE prompt_id = $1::uuid`,
              [promptId]
            )
            
            await executeSql(
              `INSERT INTO public.prompt_evaluations (prompt_id, clarity_score, specificity_score, contextual_score, effectiveness_score, feedback, created_at)
               VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, NOW())`,
              [
                promptId,
                clarityScore,
                specificityScore,
                contextualScore,
                effectivenessScore,
                JSON.stringify(analysis.feedback),
              ],
            )

            // Update prompt and version with score
            await Promise.all([
              executeSql(`UPDATE public.prompts SET score = $1 WHERE id = $2::uuid`, [overallScore, promptId]),
              executeSql(
                `UPDATE public.prompt_versions SET score = $1 WHERE prompt_id = $2::uuid AND version_number = 1`,
                [overallScore, promptId]
              )
            ])

            console.log("✅ FORK EVALUATION: LangGraph evaluation completed for prompt:", promptId, "with score:", overallScore)
            return overallScore
          } catch (evalError) {
            console.error("❌ FORK EVALUATION: LangGraph failed, falling back to simulation:", evalError)
            console.log("❌ FORK EVALUATION: Prompt text that failed:", promptText.substring(0, 200) + "...")
            
            // Fix malformed prompt for simulation too
            let simulationText = promptText
            if (promptText.includes('You are a professional expert. .') || promptText.includes('Your expertise includes .')) {
              console.log("🔧 FORK EVALUATION: Fixing malformed template for simulation")
              simulationText = promptText.replace(/You are a professional expert\. \. Your expertise includes \./g, 
                'You are a professional expert with extensive knowledge in this domain. Your expertise includes comprehensive analysis, clear communication, and practical problem-solving.')
            }
            
            const evaluationScores = simulateEvaluation(simulationText)
            
            console.log("🔍 FORK EVALUATION: Simulation scores:", {
              clarity: evaluationScores.clarity,
              specificity: evaluationScores.specificity,
              contextual: evaluationScores.contextual,
              effectiveness: evaluationScores.effectiveness
            })
            console.log("🔍 FORK EVALUATION: Simulation feedback:", evaluationScores.feedback)
            
            // Create new evaluation record
            // First delete any existing evaluation to prevent conflicts
            await executeSql(
              `DELETE FROM public.prompt_evaluations WHERE prompt_id = $1::uuid`,
              [promptId]
            )
            
            await executeSql(
              `INSERT INTO public.prompt_evaluations (prompt_id, clarity_score, specificity_score, contextual_score, effectiveness_score, feedback, created_at)
               VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, NOW())`,
              [
                promptId,
                evaluationScores.clarity,
                evaluationScores.specificity,
                evaluationScores.contextual,
                evaluationScores.effectiveness,
                JSON.stringify(evaluationScores.feedback),
              ],
            )

            const overallScore = Math.round(
              (evaluationScores.clarity +
                evaluationScores.specificity +
                evaluationScores.contextual +
                evaluationScores.effectiveness) /
                4,
            )

            console.log("⚠️ FORK EVALUATION: Simulation evaluation completed for prompt:", promptId, "with score:", overallScore)

            await Promise.all([
              executeSql(`UPDATE public.prompts SET score = $1 WHERE id = $2::uuid`, [overallScore, promptId]),
              executeSql(
                `UPDATE public.prompt_versions SET score = $1 WHERE prompt_id = $2::uuid AND version_number = 1`,
                [overallScore, promptId]
              )
            ])
            
            return overallScore
          }
        })(),
        60000, // 60 seconds timeout for evaluation
        "Evaluation process timed out after 60 seconds"
      ),

      // Process output generation with timeout
      withTimeout(
        (async () => {
          try {
            const outputResult = await generatePromptOutput(promptText)
            
            // Create new output record
            // First delete any existing output to prevent conflicts
            await executeSql(
              `DELETE FROM public.prompt_outputs WHERE prompt_id = $1::uuid`,
              [promptId]
            )
            
            await executeSql(
              `INSERT INTO public.prompt_outputs (prompt_id, output_text, created_at)
               VALUES ($1::uuid, $2, NOW())`,
              [promptId, outputResult.output_text],
            )

            console.log("Output generation completed for prompt:", promptId)
            return outputResult.output_text
          } catch (outputError) {
            console.error("Error generating output, falling back to simulation:", outputError)
            
            const simulatedOutput = await simulateOutput(promptText)
            
            // Create new output record
            // First delete any existing output to prevent conflicts
            await executeSql(
              `DELETE FROM public.prompt_outputs WHERE prompt_id = $1::uuid`,
              [promptId]
            )
            
            await executeSql(
              `INSERT INTO public.prompt_outputs (prompt_id, output_text, created_at)
               VALUES ($1::uuid, $2, NOW())`,
              [promptId, simulatedOutput],
            )
            
            return simulatedOutput
          }
        })(),
        75000, // 75 seconds timeout for output generation (can take longer)
        "Output generation process timed out after 75 seconds"
      ),
    ])

    // Log results
    console.log("Parallel processing completed for prompt:", promptId)
    console.log("Evaluation result:", evaluationResult.status)
    console.log("Output result:", outputResult.status)

    // Log any timeout errors
    if (evaluationResult.status === 'rejected') {
      console.error("Evaluation failed:", evaluationResult.reason)
    }
    if (outputResult.status === 'rejected') {
      console.error("Output generation failed:", outputResult.reason)
    }

  } catch (error) {
    console.error("Error in parallel async processing:", error)
  }
}

/**
 * Check the status of prompt processing sections
 * @param promptId The UUID of the prompt to check
 * @returns Object with status of each section
 */
export async function getPromptProcessingStatus(promptId: string) {
  'use server'
  try {
    console.log(`🔍 Checking processing status for prompt: ${promptId} at ${new Date().toISOString()}`)
    
    const [evaluationResult, outputResult] = await Promise.all([
      // Check for meaningful evaluation data (not just existence)
      executeSql(
        `SELECT clarity_score, specificity_score, contextual_score, effectiveness_score 
         FROM public.prompt_evaluations 
         WHERE prompt_id = $1::uuid AND (clarity_score > 0 OR specificity_score > 0 OR contextual_score > 0 OR effectiveness_score > 0) 
         LIMIT 1`, 
        [promptId]
      ),
      // Check for non-empty output
      executeSql(
        `SELECT id FROM public.prompt_outputs 
         WHERE prompt_id = $1::uuid AND output_text != '' AND output_text IS NOT NULL 
         LIMIT 1`, 
        [promptId]
      ),
    ])

    console.log(`🔍 Raw database results for ${promptId}:`, {
      evaluationRows: evaluationResult?.length || 0,
      outputRows: outputResult?.length || 0,
      evaluationData: evaluationResult?.[0] || null,
      outputData: outputResult?.[0] || null
    })

    const status = {
      evaluation: evaluationResult && evaluationResult.length > 0,
      output: outputResult && outputResult.length > 0,
    }

    console.log(`Processing status for prompt ${promptId}:`, {
      status,
      evaluationCount: evaluationResult?.length || 0,
      outputCount: outputResult?.length || 0
    })

    return {
      success: true,
      status
    }
  } catch (error) {
    console.error("Error checking prompt processing status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check status",
      status: {
        evaluation: false,
        output: false,
      }
    }
  }
}

/**
 * Copy a prompt (duplicate it for the current user) - COMPLETE COPY WITHOUT EVALUATION
 * @param promptId ID of the prompt to copy
 * @param userId ID of the user who wants to copy the prompt
 * @returns Object with success status and new prompt ID or error message
 */
export async function copyPrompt(promptId: string, userId: string) {
  try {
    console.log("🔄 COPY PROMPT: Starting complete copy without evaluation for prompt:", promptId)
    
    // Get the original prompt and all related data
    const originalResult = await getPromptDetails(promptId)
    
    if (!originalResult.success || !originalResult.prompt) {
      return {
        success: false,
        error: "Original prompt not found",
      }
    }

    const originalPrompt = originalResult.prompt

    console.log("🔄 COPY PROMPT: Original prompt found:", {
      id: originalPrompt.id,
      title: originalPrompt.title,
      score: originalPrompt.score,
      hasEvaluation: !!originalResult.evaluation,
      hasOutput: !!originalResult.output,
      suggestionsCount: originalResult.suggestions?.length || 0
    })

    // Create the copy with modified title and description
    const copyTitle = originalPrompt.title
    const copyDescription = originalPrompt.description || originalPrompt.title

    // Create new prompt with the same content and score (no re-evaluation needed)
    const insertResult = await executeSql(
      `INSERT INTO public.prompts (title, prompt_text, description, industry, is_public, user_id, created_at, updated_at, score)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
       RETURNING id`,
      [
        copyTitle, 
        originalPrompt.prompt_text, 
        copyDescription, 
        originalPrompt.industry, 
        false, // Make copies private by default
        userId, 
        originalPrompt.score || 0 // Preserve original score
      ],
    )

    if (!insertResult || insertResult.length === 0 || !insertResult[0].id) {
      throw new Error("Failed to create prompt copy")
    }

    const newPromptId = insertResult[0].id
    console.log("🔄 COPY PROMPT: New prompt created with ID:", newPromptId)

    // Create the first version for the copy with the same score
    await executeSql(
      `INSERT INTO public.prompt_versions (prompt_id, version_number, prompt_text, score, created_at)
       VALUES ($1::uuid, 1, $2, $3, NOW())`,
      [newPromptId, originalPrompt.prompt_text, originalPrompt.score || 0],
    )

    // Copy ALL related data without modification
    const copyPromises = []

    // Copy evaluation if it exists
    if (originalResult.evaluation) {
      console.log("🔄 COPY PROMPT: Copying evaluation data")
      copyPromises.push(
        executeSql(
          `INSERT INTO public.prompt_evaluations (prompt_id, clarity_score, specificity_score, contextual_score, effectiveness_score, feedback, created_at)
           VALUES ($1::uuid, $2, $3, $4, $5, $6::jsonb, NOW())`,
          [
            newPromptId,
            originalResult.evaluation.clarity_score,
            originalResult.evaluation.specificity_score,
            originalResult.evaluation.contextual_score,
            originalResult.evaluation.effectiveness_score,
            originalResult.evaluation.feedback,
          ],
        )
      )
    }

    // Copy output if it exists
    if (originalResult.output) {
      console.log("🔄 COPY PROMPT: Copying output data")
      copyPromises.push(
        executeSql(
          `INSERT INTO public.prompt_outputs (prompt_id, output_text, created_at)
           VALUES ($1::uuid, $2, NOW())`,
          [newPromptId, originalResult.output.output_text],
        )
      )
    }

    // Copy improvement suggestions if they exist
    if (originalResult.suggestions && originalResult.suggestions.length > 0) {
      console.log("🔄 COPY PROMPT: Copying", originalResult.suggestions.length, "suggestions")
      const suggestionPromises = originalResult.suggestions.map(suggestion =>
        executeSql(
          `INSERT INTO public.improvement_suggestions (prompt_id, section, priority, suggestion, created_at)
           VALUES ($1::uuid, $2, $3, $4, NOW())`,
          [newPromptId, suggestion.section, suggestion.priority, suggestion.suggestion],
        )
      )
      copyPromises.push(...suggestionPromises)
    }

    // Execute all copy operations in parallel
    if (copyPromises.length > 0) {
      await Promise.all(copyPromises)
      console.log("🔄 COPY PROMPT: All related data copied successfully")
    } else {
      console.log("🔄 COPY PROMPT: No related data to copy")
    }

    revalidatePath("/prompts")
    revalidatePath("/dashboard")

    console.log("✅ COPY PROMPT: Copy completed successfully without evaluation")

    return {
      success: true,
      promptId: newPromptId,
      message: "Prompt copied successfully",
    }
  } catch (error) {
    console.error("❌ COPY PROMPT: Error copying prompt:", error)
    return {
      success: false,
      error: "Failed to copy prompt",
    }
  }
}

// Generate improved prompt using AI based on suggestions and user input
async function generateImprovedPrompt(
  originalPrompt: string,
  appliedSuggestions: string[],
  improvementNotes: string
): Promise<string> {
  try {
    console.log("🔧 Starting prompt improvement with:", {
      originalLength: originalPrompt.length,
      suggestionsCount: appliedSuggestions.length,
      hasNotes: !!improvementNotes
    })

    // Build improvement instructions with emphasis on maintaining quality
    let improvementInstructions = `You are an expert prompt engineer. Your task is to improve the following prompt while MAINTAINING OR IMPROVING its evaluation score.

CRITICAL REQUIREMENTS:
- The improved prompt MUST score equal or higher than the original on clarity, specificity, contextual awareness, and effectiveness
- Maintain the original intent and purpose completely
- Only make changes that genuinely improve the prompt quality
- If the original prompt is already well-structured, make minimal targeted improvements

IMPROVEMENTS TO APPLY:\n\n`
    
    if (appliedSuggestions.length > 0) {
      improvementInstructions += "AI Suggestions to integrate:\n"
      appliedSuggestions.forEach((suggestion, index) => {
        improvementInstructions += `${index + 1}. ${suggestion}\n`
      })
      improvementInstructions += "\n"
    }
    
    if (improvementNotes) {
      improvementInstructions += `User-requested improvements:\n${improvementNotes}\n\n`
    }
    
    improvementInstructions += `ORIGINAL PROMPT TO IMPROVE:\n${originalPrompt}\n\n`
    improvementInstructions += `IMPROVEMENT GUIDELINES:
- Use modern prompt engineering best practices (# Identity, # Instructions, # Task sections when appropriate)
- Enhance clarity without changing the core purpose
- Add specificity where it improves outcomes
- Include relevant context that helps achieve better results
- Maintain professional structure and tone
- If the prompt already has good structure, enhance rather than rebuild
- Return ONLY the improved prompt text, no explanations or meta-commentary

QUALITY ASSURANCE:
- The improved prompt should score 85+ on clarity, specificity, contextual awareness, and effectiveness
- Every change should have a clear purpose and benefit
- Preserve what already works well in the original prompt`

    console.log("🔧 Sending improvement request to AI (using gpt-4o for consistency)...")
    
    // Use the same model as evaluation for consistency (gpt-4o instead of gpt-4o-mini)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Changed from gpt-4o-mini to match evaluation model
        messages: [
          {
            role: "system",
            content: "You are an expert prompt engineer with deep knowledge of what makes prompts score highly on clarity, specificity, contextual awareness, and effectiveness. Your improvements must maintain or increase the prompt's evaluation score."
          },
          {
            role: "user",
            content: improvementInstructions
          }
        ],
        temperature: 0.1, // Lower temperature for more consistent, quality-focused improvements
        max_tokens: 2500, // Increased token limit for more comprehensive improvements
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const improvedPrompt = data.choices[0]?.message?.content?.trim()

    if (!improvedPrompt) {
      throw new Error("No improved prompt generated")
    }

    // Basic validation: ensure the improved prompt is substantive
    if (improvedPrompt.length < originalPrompt.length * 0.8) {
      console.warn("🔧 Improved prompt seems too short, using original")
      return originalPrompt
    }

    console.log("🔧 Successfully generated improved prompt:", {
      originalLength: originalPrompt.length,
      improvedLength: improvedPrompt.length,
      improvement: improvedPrompt.length > originalPrompt.length ? "expanded" : "condensed",
      changeRatio: (improvedPrompt.length / originalPrompt.length).toFixed(2)
    })

    // Advanced validation: Check if the improved prompt actually scores better
    try {
      console.log("🔧 Validating improvement by comparing scores...")
      
      // Import the analyzePrompt function for validation
      const { analyzePrompt } = await import("@/lib/langgraph-service")
      
      // Evaluate both prompts in parallel
      const [originalAnalysis, improvedAnalysis] = await Promise.all([
        analyzePrompt(originalPrompt).catch(() => null),
        analyzePrompt(improvedPrompt).catch(() => null)
      ])
      
      if (originalAnalysis && improvedAnalysis) {
        const originalScore = originalAnalysis.overall_score
        const improvedScore = improvedAnalysis.overall_score
        
        console.log("🔧 Score comparison:", {
          original: originalScore,
          improved: improvedScore,
          difference: improvedScore - originalScore
        })
        
        // Only use improved prompt if it scores equal or higher
        if (improvedScore >= originalScore) {
          console.log("✅ Improved prompt validated - scores equal or higher")
          return improvedPrompt
        } else {
          console.warn("⚠️ Improved prompt scores lower, using original")
          return originalPrompt
        }
      } else {
        // Fallback to simulation evaluation if AI evaluation fails
        console.log("🔧 AI evaluation failed, using simulation for validation...")
        
        const originalSimulation = simulateEvaluation(originalPrompt)
        const improvedSimulation = simulateEvaluation(improvedPrompt)
        
        const originalScore = Math.round(
          (originalSimulation.clarity + originalSimulation.specificity + 
           originalSimulation.contextual + originalSimulation.effectiveness) / 4
        )
        const improvedScore = Math.round(
          (improvedSimulation.clarity + improvedSimulation.specificity + 
           improvedSimulation.contextual + improvedSimulation.effectiveness) / 4
        )
        
        console.log("🔧 Simulation score comparison:", {
          original: originalScore,
          improved: improvedScore,
          difference: improvedScore - originalScore
        })
        
        if (improvedScore >= originalScore) {
          console.log("✅ Improved prompt validated via simulation - scores equal or higher")
          return improvedPrompt
        } else {
          console.warn("⚠️ Improved prompt scores lower via simulation, using original")
          return originalPrompt
        }
      }
    } catch (validationError) {
      console.error("Error validating improvement:", validationError)
      console.log("🔧 Validation failed, using improved prompt anyway")
      return improvedPrompt
    }

  } catch (error) {
    console.error("Error generating improved prompt:", error)
    // Return original prompt if improvement fails to ensure no degradation
    console.log("🔧 Falling back to original prompt due to improvement error")
    return originalPrompt
  }
}
