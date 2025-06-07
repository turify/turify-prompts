export interface User {
  id: string
  name: string | null
  email: string
  image?: string | null
  role?: string
  emailNotifications?: boolean
  pushNotifications?: boolean
  theme?: string
  language?: string
  createdAt: Date
  updatedAt: Date
}

export interface Prompt {
  id: number
  title: string
  content: string
  userId: string | null
  category?: string | null
  tags?: string[]
  isPublic: boolean
  version: number
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface PromptVersion {
  id: string
  prompt_id: string
  version_number: number
  prompt_text: string
  score: number | null
  created_at: Date
}

export interface PromptEvaluation {
  id: string
  prompt_id: string
  version_id: string | null
  clarity_score: number | null
  specificity_score: number | null
  contextual_score: number | null
  effectiveness_score: number | null
  feedback: any | null
  created_at: Date
}

export interface PromptOutput {
  id: string
  prompt_id: string
  version_id: string | null
  output_text: string
  created_at: Date
}

export interface Favorite {
  id: string
  user_id: string
  prompt_id: string
  created_at: Date
}

export interface ImprovementSuggestion {
  id: string
  prompt_id: string
  version_id: string | null
  section: string | null
  priority: string | null
  suggestion: string
  created_at: Date
}

export interface AnalyticsEvent {
  id: number
  eventType: string
  eventData?: any
  userId?: string
  promptId?: number
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface PromptStats {
  views: number
  shares: number
  copies: number
  likes: number
}

export type UserRole = "user" | "admin"
