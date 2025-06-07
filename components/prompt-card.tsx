import Link from "next/link"
import { Star, Eye, GitBranch } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PromptCardProps {
  prompt: {
    id: string
    title: string
    prompt_text: string
    description?: string
    industry?: string
    score?: number
    impressions?: number
    created_at: string
    current_version?: number
    latest_version_number?: number
  }
}

export function PromptCard({ prompt }: PromptCardProps) {
  // Determine color based on score with dark mode support
  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    if (score >= 90) return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700"
    if (score >= 80) return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700"
    if (score >= 70) return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700"
    return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700"
  }

  // Determine border color based on score with dark mode support
  const getBorderColor = (score: number | null) => {
    if (!score) return "border-gray-200 dark:border-gray-700"
    if (score >= 90) return "border-green-300 dark:border-green-600"
    if (score >= 80) return "border-blue-300 dark:border-blue-600"
    if (score >= 70) return "border-purple-300 dark:border-purple-600"
    return "border-amber-300 dark:border-amber-600"
  }

  const scoreColor = getScoreColor(prompt.score || null)
  const borderColor = getBorderColor(prompt.score || null)

  // Generate a preview from the prompt text (shorter for compact card)
  const preview = prompt.prompt_text.length > 80 ? prompt.prompt_text.substring(0, 80) + "..." : prompt.prompt_text

  // Determine if this prompt has multiple versions
  const hasVersions = prompt.current_version && prompt.current_version > 1
  const currentVersion = prompt.current_version || 1

  return (
    <Link href={`/prompt/${prompt.id}`} className="block">
      <Card className={`${borderColor} border-2 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-purple-500/10 transition-all duration-200 overflow-hidden h-48 flex flex-col group hover:scale-[1.02] cursor-pointer bg-card dark:bg-slate-800/50 backdrop-blur-sm`}>
        <CardContent className="p-2 flex flex-col h-full">
          {/* Header with title and score */}
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-card-foreground">{prompt.title}</h3>
            </div>
            <div className={`${scoreColor} px-1.5 py-0.5 rounded-full text-xs font-medium ml-2 flex items-center gap-0.5 border`}>
              <Star className="h-2.5 w-2.5 fill-current" />
              {prompt.score || "N/A"}
            </div>
          </div>

          {/* Industry and Version badges */}
          <div className="flex items-center gap-1.5 mb-1.5">
            {prompt.industry && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 bg-white/80 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600 h-5">
                {prompt.industry}
              </Badge>
            )}
            {hasVersions && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal dark:text-brand-teal border-brand-teal/20 dark:border-brand-teal/40 h-5">
                <GitBranch className="h-2.5 w-2.5 mr-0.5" />
                v{currentVersion}
              </Badge>
            )}
          </div>

          {/* Description/Preview */}
          <div className="flex-1 mb-1.5">
            <p className="text-xs text-muted-foreground line-clamp-3 leading-snug">
              {prompt.description || preview}
            </p>
          </div>

          {/* Footer with stats and button */}
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Eye className="h-2.5 w-2.5" />
                  <span>{prompt.impressions || 0}</span>
                </div>
                <div>
                  {new Date(prompt.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric"
                  })}
                </div>
              </div>
            </div>
            
            <Button
              size="sm"
              className="w-full h-6 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 text-xs pointer-events-none"
            >
              View Prompt
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
