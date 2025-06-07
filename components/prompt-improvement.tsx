"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressiveLoader } from "@/components/progressive-loader"
import type { ImprovementSuggestion } from "@/lib/types"

interface PromptImprovementProps {
  suggestions?: ImprovementSuggestion[]
  isReady?: boolean
}

export function PromptImprovement({ suggestions = [], isReady = true }: PromptImprovementProps) {
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-brand-pink/10 dark:bg-brand-pink/20 text-brand-pink border-brand-pink/20 dark:border-brand-pink/30"
      case "medium":
        return "bg-brand-amber/10 dark:bg-brand-amber/20 text-brand-amber border-brand-amber/20 dark:border-brand-amber/30"
      case "low":
        return "bg-brand-teal/10 dark:bg-brand-teal/20 text-brand-teal border-brand-teal/20 dark:border-brand-teal/30"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <Card className="border-2 border-brand-pink/20 shadow-md">
      <CardHeader className="bg-gradient-to-r from-brand-pink/10 to-brand-purple/10">
        <CardTitle>Improvement Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {!isReady ? (
          <ProgressiveLoader title="Recommendations" isReady={false} />
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className={`rounded-md p-4 border ${getPriorityColor(suggestion.priority)}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase">{suggestion.priority || "medium"} priority</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {suggestion.section || "general"}
                </span>
              </div>
              <p className="text-sm">{suggestion.suggestion}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No improvement suggestions available</p>
            <p className="text-sm text-muted-foreground mt-2">
              This prompt appears to be well-structured already!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
