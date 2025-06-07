"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Trophy, Star } from "lucide-react"
import type { PromptEvaluation as PromptEvaluationType } from "@/lib/types"

interface PromptEvaluationProps {
  evaluation: PromptEvaluationType | null
  prompt?: any // Add prompt prop to access the overall score
  suggestions?: any[] // Optional - fallback for legacy data
}

export function PromptEvaluation({ evaluation, prompt, suggestions }: PromptEvaluationProps) {
  if (!evaluation) {
    return (
      <Card className="border border-brand-teal/20">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground py-8">No evaluation data available</p>
        </CardContent>
      </Card>
    )
  }

  // Parse feedback from JSON if it's a string
  const feedback = typeof evaluation.feedback === "string" ? JSON.parse(evaluation.feedback) : evaluation.feedback || []
  
  // Get the overall score from the prompt
  const overallScore = prompt?.score || 0
  const isHighScore = overallScore > 80
  
  // Debug logging
  console.log("PromptEvaluation Debug:", {
    overallScore,
    isHighScore,
    prompt: prompt,
    feedbackLength: feedback.length,
    evaluation: evaluation
  })

  return (
    <div className="space-y-6">
      <Card className="border border-brand-teal/20 bg-gradient-to-r from-brand-teal/5 to-transparent">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Score Breakdown</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Clarity</span>
                <span className="text-sm font-medium">{evaluation.clarity_score || 0}/100</span>
              </div>
              <Progress
                value={evaluation.clarity_score || 0}
                className="h-2 bg-muted/50"
                indicatorClassName="bg-brand-purple"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Specificity</span>
                <span className="text-sm font-medium">{evaluation.specificity_score || 0}/100</span>
              </div>
              <Progress
                value={evaluation.specificity_score || 0}
                className="h-2 bg-muted/50"
                indicatorClassName="bg-brand-blue"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contextual Completeness</span>
                <span className="text-sm font-medium">{evaluation.contextual_score || 0}/100</span>
              </div>
              <Progress
                value={evaluation.contextual_score || 0}
                className="h-2 bg-muted/50"
                indicatorClassName="bg-brand-teal"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Instruction Effectiveness</span>
                <span className="text-sm font-medium">{evaluation.effectiveness_score || 0}/100</span>
              </div>
              <Progress
                value={evaluation.effectiveness_score || 0}
                className="h-2 bg-muted/50"
                indicatorClassName="bg-brand-pink"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-brand-teal/20">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Improvement Recommendations</h3>
          <div className="space-y-4">
            {/* Congratulatory message for high scores */}
            {(isHighScore || overallScore >= 80) && (
              <div className="rounded-md p-4 border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <Sparkles className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-sm font-semibold text-green-800">
                    Excellent Work! 🎉
                  </div>
                </div>
                <p className="text-sm text-green-700">
                  Congratulations! Your prompt scored <span className="font-semibold">{overallScore}/100</span> - that's outstanding! 
                  This prompt demonstrates excellent clarity, specificity, and effectiveness. It's well-crafted and should produce 
                  high-quality results. Keep up the great work!
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-green-600 ml-1 font-medium">Premium Quality</span>
                </div>
              </div>
            )}
            
            {/* Display feedback from evaluation */}
            {feedback && feedback.length > 0 && (
              feedback.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`rounded-md p-4 border ${
                    item.category === "Improvement"
                      ? item.priority === "high"
                        ? "border-red-200 bg-red-50"
                        : item.priority === "low"
                        ? "border-blue-200 bg-blue-50"
                        : "border-amber-200 bg-amber-50"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`text-sm font-medium ${
                        item.category === "Improvement"
                          ? item.priority === "high"
                            ? "text-red-700"
                            : item.priority === "low"
                            ? "text-blue-700"
                            : "text-amber-700"
                          : "text-green-700"
                      }`}
                    >
                      {item.category === "Improvement" ? "💡 Improvement" : "✅ Strength"}
                    </div>
                    {item.category === "Improvement" && item.priority && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : item.priority === "low"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.priority} priority
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{item.message}</p>
                </div>
              ))
            )}
            
            {/* Fallback to suggestions if no feedback */}
            {(!feedback || feedback.length === 0) && suggestions && suggestions.length > 0 && (
              suggestions.map((suggestion: any, index: number) => (
                <div
                  key={index}
                  className={`rounded-md p-4 border ${
                    suggestion.priority === "high"
                      ? "border-red-200 bg-red-50"
                      : suggestion.priority === "medium"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`text-sm font-medium capitalize ${
                        suggestion.priority === "high"
                          ? "text-red-700"
                          : suggestion.priority === "medium"
                          ? "text-yellow-700"
                          : "text-blue-700"
                      }`}
                    >
                      {suggestion.section}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        suggestion.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : suggestion.priority === "medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {suggestion.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{suggestion.suggestion}</p>
                </div>
              ))
            )}
            
            {(!feedback || feedback.length === 0) && (!suggestions || suggestions.length === 0) && !isHighScore && (
              <p className="text-center text-muted-foreground">No improvement recommendations available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
