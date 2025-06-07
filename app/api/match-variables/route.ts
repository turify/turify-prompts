import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/app/actions/auth-actions"

interface VariableMatch {
  original: string
  suggested: string
  confidence: number
}

// Simple similarity function using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[_\s-]/g, '')
  const s2 = str2.toLowerCase().replace(/[_\s-]/g, '')
  
  if (s1 === s2) return 1.0
  
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Enhanced matching with semantic understanding
function findSemanticMatches(variable: string, preferences: Record<string, string>): VariableMatch[] {
  const matches: VariableMatch[] = []
  
  // Common variable name mappings
  const semanticMappings: Record<string, string[]> = {
    'target_audience': ['audience', 'target', 'demographic', 'customer_segment', 'user_group'],
    'product_name': ['product', 'service', 'offering', 'solution', 'brand'],
    'campaign_goal': ['goal', 'objective', 'purpose', 'aim', 'target_goal'],
    'company_name': ['company', 'business', 'organization', 'brand', 'firm'],
    'user_name': ['name', 'user', 'customer_name', 'client_name', 'person'],
    'location': ['place', 'city', 'region', 'area', 'geography'],
    'industry': ['sector', 'field', 'domain', 'vertical', 'market'],
    'tone': ['style', 'voice', 'mood', 'approach', 'manner'],
    'budget': ['cost', 'price', 'investment', 'spend', 'allocation'],
    'timeline': ['deadline', 'timeframe', 'schedule', 'duration', 'period']
  }
  
  // Check direct similarity first
  for (const [prefKey, prefValue] of Object.entries(preferences)) {
    const similarity = calculateSimilarity(variable, prefKey)
    if (similarity > 0.6) {
      matches.push({
        original: variable,
        suggested: prefKey,
        confidence: similarity
      })
    }
  }
  
  // Check semantic mappings
  for (const [canonical, variants] of Object.entries(semanticMappings)) {
    if (variants.some(variant => calculateSimilarity(variable, variant) > 0.8)) {
      // Found a semantic match, check if user has this canonical form or variants
      for (const [prefKey, prefValue] of Object.entries(preferences)) {
        if (prefKey === canonical || variants.some(variant => calculateSimilarity(prefKey, variant) > 0.8)) {
          matches.push({
            original: variable,
            suggested: prefKey,
            confidence: 0.9 // High confidence for semantic matches
          })
        }
      }
    }
  }
  
  // Remove duplicates and sort by confidence
  const uniqueMatches = matches.reduce((acc, match) => {
    const existing = acc.find(m => m.suggested === match.suggested)
    if (!existing || existing.confidence < match.confidence) {
      return [...acc.filter(m => m.suggested !== match.suggested), match]
    }
    return acc
  }, [] as VariableMatch[])
  
  return uniqueMatches.sort((a, b) => b.confidence - a.confidence)
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { extractedVariables, userPreferences } = await request.json()

    if (!Array.isArray(extractedVariables) || !userPreferences || typeof userPreferences !== 'object') {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      )
    }

    const allMatches: VariableMatch[] = []

    // Find matches for each extracted variable
    for (const variable of extractedVariables) {
      const matches = findSemanticMatches(variable, userPreferences)
      allMatches.push(...matches)
    }

    // Filter to only high-confidence matches
    const highConfidenceMatches = allMatches.filter(match => match.confidence > 0.7)

    return NextResponse.json(highConfidenceMatches)
  } catch (error) {
    console.error("Error matching variables:", error)
    return NextResponse.json(
      { error: "Failed to match variables" },
      { status: 500 }
    )
  }
} 