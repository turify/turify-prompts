import { ChatOpenAI } from "@langchain/openai"
import { INDUSTRIES, type Industry } from "@/lib/constants"

// Explicitly configure LangSmith tracing
process.env.LANGCHAIN_TRACING_V2 = "true"

// Verify LangSmith configuration
console.log("LangSmith Configuration:")
console.log("LANGCHAIN_TRACING_V2:", process.env.LANGCHAIN_TRACING_V2)
console.log("LANGCHAIN_API_KEY:", process.env.LANGCHAIN_API_KEY ? "✓ Set" : "✗ Missing")
console.log("LANGCHAIN_PROJECT:", process.env.LANGCHAIN_PROJECT)

// Initialize the LLM with explicit project name
const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
})

// Test function to verify LangSmith connection
export async function testLangSmithConnection() {
  try {
    console.log("Testing LangSmith connection...")
    const response = await llm.invoke([
      { role: "user", content: "Say 'LangSmith tracing test successful'" }
    ])
    console.log("LangSmith test response:", response.content)
    return { success: true, message: response.content }
  } catch (error) {
    console.error("LangSmith test failed:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Define types for our LangGraph nodes
type PromptAnalysisResult = {
  clarity_score: number
  specificity_score: number
  contextual_score: number
  effectiveness_score: number
  overall_score: number
  feedback: Array<{
    category: string
    message: string
    priority?: string // Optional for backward compatibility with "Strength" items
  }>
}

type PromptOutputResult = {
  output_text: string
}

// Helper function to add timeout to promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ])
}

// LangGraph service for prompt analysis
export async function analyzePrompt(promptText: string): Promise<PromptAnalysisResult> {
  try {
    console.log("Analyzing prompt with LangGraph...")

    const systemPrompt = `
      You are an expert prompt engineer who evaluates prompts for their effectiveness.
      
      MODERN PROMPT STRUCTURE RECOGNITION:
      - Well-structured prompts often use sections like "# Identity", "# Instructions", "# Examples", "# Task"
      - Clear role definition (e.g., "You are a coding assistant...")
      - Specific, actionable instructions with bullet points
      - Concrete examples when helpful
      - Appropriate constraints and guidelines
      - Professional formatting and organization
      
      SCORING CRITERIA (1-100 scale):
      
      CLARITY (How clear and understandable is the prompt?):
      - 90-100: Excellent structure with clear sections, role definition, and easy-to-follow instructions
      - 80-89: Good structure with most clarity elements present
      - 70-79: Decent clarity with some organization
      - 60-69: Basic clarity with minimal structure
      - Below 60: Poor or confusing structure
      
      SPECIFICITY (How detailed and precise are the instructions?):
      - 90-100: Highly specific with detailed requirements, constraints, and precise guidance
      - 80-89: Good specificity with clear requirements
      - 70-79: Decent specificity with some detail
      - 60-69: Basic specificity with minimal detail
      - Below 60: Vague or unclear requirements
      
      CONTEXTUAL (How well does it provide context and background?):
      - 90-100: Excellent context with role definition, examples, and situational awareness
      - 80-89: Good context with most elements present
      - 70-79: Decent context with some background
      - 60-69: Basic context with minimal background
      - Below 60: Poor or missing context
      
      EFFECTIVENESS (How likely is it to produce consistent, high-quality results?):
      - 90-100: Highly effective structure that should produce excellent, consistent results
      - 80-89: Good effectiveness with strong potential for quality results
      - 70-79: Decent effectiveness with reasonable results expected
      - 60-69: Basic effectiveness with variable results
      - Below 60: Poor effectiveness with inconsistent results
      
      IMPORTANT: Be consistent in your scoring. Well-structured prompts with clear sections, 
      role definitions, specific instructions, and professional formatting should score 85+ 
      across all categories.
      
      Return your analysis as a JSON object:
      {
        "clarity_score": number,
        "specificity_score": number,
        "contextual_score": number,
        "effectiveness_score": number,
        "overall_score": number,
        "feedback": [
          {"category": "Strength", "message": "..."},
          {"category": "Improvement", "message": "...", "priority": "high|medium|low"}
        ]
      }
    `

    // Add 30-second timeout to prevent hanging
    const response = await withTimeout(
      llm.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: promptText }
      ]),
      30000, // 30 seconds
      "LangGraph analysis timed out after 30 seconds"
    )

    // Parse the response as JSON
    const result = JSON.parse(response.content as string) as PromptAnalysisResult
    
    // Ensure overall_score is calculated consistently as average of individual scores
    // This prevents inconsistency between AI-provided overall_score and our calculated average
    const calculatedOverallScore = Math.round(
      (result.clarity_score + result.specificity_score + result.contextual_score + result.effectiveness_score) / 4
    )
    
    result.overall_score = calculatedOverallScore
    console.log("Analysis result with calculated overall score:", result)

    return result
  } catch (error) {
    console.error("Error analyzing prompt:", error)
    // Return default values if analysis fails
    return {
      clarity_score: 70,
      specificity_score: 70,
      contextual_score: 70,
      effectiveness_score: 70,
      overall_score: 70,
      feedback: [
        {
          category: "Error",
          message: "Failed to analyze prompt. Please try again later.",
        },
      ],
    }
  }
}

// Generate output for a prompt
export async function generatePromptOutput(promptText: string): Promise<PromptOutputResult> {
  try {
    console.log("Generating output for prompt...")

    // Add 45-second timeout to prevent hanging (output generation can take longer)
    const response = await withTimeout(
      llm.invoke([
        { role: "user", content: promptText }
      ]),
      45000, // 45 seconds
      "LangGraph output generation timed out after 45 seconds"
    )

    return {
      output_text: response.content as string,
    }
  } catch (error) {
    console.error("Error generating output:", error)
    return {
      output_text: "Failed to generate output. Please try again later.",
    }
  }
}

// Generate comprehensive prompt metadata (title, description, and industry) using AI
export async function generatePromptMetadata(promptText: string, userCountry?: string): Promise<{ title: string; description: string; industry: Industry }> {
  try {
    console.log("Generating comprehensive prompt metadata...")
    console.log("User country provided:", userCountry || "Not specified")
    console.log("Will add locale context:", userCountry && userCountry !== "United States")

    // Create the list of industries from the constants
    const industryList = INDUSTRIES.map(industry => `- ${industry.value}`).join('\n      ')
    const allowedIndustries = INDUSTRIES.map(industry => industry.value)

    // Add locale context if user country is provided
    const localeContext = userCountry && userCountry !== "United States" 
      ? `\n      - Use ${userCountry} spelling (optimise/optimize, analyse/analyze, maximise/maximize)`
      : ''

    const systemPrompt = `
      Analyze the USER'S PROMPT (not this system message) and generate a title, description, and industry classification.
      
      Available industries:
${industryList}
      
      Rules:
      - Title: 2-6 words, descriptive
      - Description: One sentence (15-40 words) describing what this prompt helps users accomplish
      - Industry: Select from the list above
      - Don't mention locale in the description${localeContext}
      
      Examples:
      - "Helps create compelling sales emails that address customer objections and drive conversions."
      - "Generates comprehensive marketing strategies tailored to specific business goals and target audiences."
      
      Return only valid JSON:
      {
        "title": "Your Title",
        "description": "Your description sentence.", 
        "industry": "Industry Name"
      }
    `

    const response = await withTimeout(
      llm.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: promptText }
      ]),
      30000, // 30 seconds
      "LangGraph metadata generation timed out after 30 seconds"
    )

    const responseText = (response.content as string).trim()
    console.log("Generated metadata response:", responseText)

    // Clean up the response - remove markdown code blocks if present
    let cleanedResponse = responseText
    if (responseText.startsWith('```json') || responseText.startsWith('```')) {
      cleanedResponse = responseText
        .replace(/^```json\s*/, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '')
        .trim()
    }
    
    console.log("Cleaned response for parsing:", cleanedResponse)

    // Parse the JSON response with error handling
    let metadata
    try {
      metadata = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError)
      console.error("Original response:", responseText)
      console.error("Cleaned response:", cleanedResponse)
      throw new Error("Invalid JSON response from AI")
    }
    
    // Validate the response structure
    if (!metadata || typeof metadata !== 'object' || !metadata.title || !metadata.description || !metadata.industry) {
      console.error("Invalid metadata structure:", metadata)
      throw new Error("Invalid metadata structure returned")
    }

    // Clean up the industry value (trim whitespace)
    metadata.industry = metadata.industry.trim()
    
    // Debug logging
    console.log("AI returned industry:", `"${metadata.industry}"`)
    console.log("Allowed industries:", allowedIndustries)
    console.log("Industry match check:", allowedIndustries.includes(metadata.industry))
    
    // Validate that the returned industry exists in our list
    if (!allowedIndustries.includes(metadata.industry)) {
      console.warn(`AI returned invalid industry: "${metadata.industry}", falling back to General`)
      console.warn("Available industries:", allowedIndustries)
      metadata.industry = "General"
    }

    console.log("Final metadata:", metadata)
    return {
      title: metadata.title,
      description: metadata.description,
      industry: metadata.industry as Industry
    }
  } catch (error) {
    console.error("Error generating prompt metadata:", error)
    
    // Fallback to basic title generation
    const fallbackTitle = generateFallbackTitle(promptText)
    return {
      title: fallbackTitle,
      description: "Provides instructions and guidance for generating high-quality content tailored to specific requirements.",
      industry: "General"
    }
  }
}

// Fallback title generation using simple extraction
function generateFallbackTitle(promptText: string): string {
  const words = promptText.toLowerCase().split(/\s+/)
  
  // Look for action words or key descriptors
  const actionWords = ["write", "create", "generate", "analyze", "review", "help", "assist", "build", "design", "plan", "summarize", "explain", "translate", "optimize", "develop", "increase", "improve", "boost", "enhance", "identify", "strategies"]
  const contextWords = ["email", "code", "marketing", "sales", "content", "blog", "article", "report", "proposal", "presentation", "letter", "response", "strategy", "plan", "guide", "tutorial", "recipe", "story", "poem", "summary", "growth", "revenue", "business", "objections", "pitch", "training"]
  
  let action = ""
  let context = ""
  
  // Find action words
  for (const word of actionWords) {
    if (words.includes(word) || words.includes(word + "s") || words.includes(word + "ing")) {
      action = word.charAt(0).toUpperCase() + word.slice(1)
      break
    }
  }
  
  // Find context words
  for (const word of contextWords) {
    if (words.includes(word) || words.includes(word + "s")) {
      context = word.charAt(0).toUpperCase() + word.slice(1)
      break
    }
  }
  
  // Special patterns for sales and business growth
  if (words.includes("sales") && (words.includes("growth") || words.includes("strategies") || words.includes("increase"))) {
    return "Sales Growth Strategist"
  } else if (words.includes("revenue") && (words.includes("growth") || words.includes("increase") || words.includes("boost"))) {
    return "Revenue Growth Advisor"
  } else if (words.includes("business") && (words.includes("growth") || words.includes("strategies") || words.includes("expansion"))) {
    return "Business Growth Planner"
  } else if (words.includes("sales") && words.includes("objections")) {
    return "Sales Objection Handler"
  }
  
  // Construct title
  if (action && context) {
    return `${context} ${action}r`
  } else if (context) {
    return `${context} Assistant`
  } else if (action) {
    return `${action} Helper`
  } else {
    // Ultimate fallback - take first meaningful words
    const meaningfulWords = words.filter(word => 
      word.length > 2 && 
      !["the", "and", "for", "you", "are", "with", "this", "that", "will", "can", "should", "would", "could"].includes(word)
    ).slice(0, 3)
    
    return meaningfulWords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  }
}

// Process a prompt with LangGraph (analyze and generate output)
export async function processPromptWithLangGraph(promptText: string) {
  try {
    console.log("Processing prompt with LangGraph...")

    // Run all operations in parallel for efficiency
    const [analysis, output] = await Promise.all([
      analyzePrompt(promptText),
      generatePromptOutput(promptText),
    ])

    return {
      success: true,
      analysis,
      output,
    }
  } catch (error) {
    console.error("Error processing prompt with LangGraph:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}
