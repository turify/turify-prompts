"use client"

import { Info, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PromptGuideProps {
  mode: "create" | "evaluate"
}

export function PromptGuide({ mode }: PromptGuideProps) {
  const createGuide = {
    title: "Prompt Generation Guide",
    description: "Describe what you want to create and we'll generate a prompt",
    tips: [
      "Describe the type of content you want to create (e.g., marketing email, code review)",
      "Mention your target audience or context",
      "Include any specific requirements or constraints",
      "Be specific about the desired outcome or format",
      "The system will transform your description into a proper prompt",
      "Then generate sample output and evaluate the prompt quality",
    ],
  }

  const evaluateGuide = {
    title: "Prompt Evaluation Guide",
    description: "Test an existing prompt for effectiveness",
    tips: [
      "Paste a complete prompt that you want to evaluate",
      "The system will analyze clarity, specificity, and effectiveness",
      "You'll get detailed feedback on strengths and improvements",
      "See how the prompt performs with sample output generation",
      "Get AI-powered suggestions for enhancement",
      "No account required for basic evaluation",
    ],
  }

  const currentGuide = mode === "create" ? createGuide : evaluateGuide
  const iconColor = mode === "create" ? "text-brand-purple" : "text-brand-amber"

  return (
    <Card
      className="border-2 border-opacity-20 shadow-md"
      style={{ borderColor: mode === "create" ? "#7C3AED" : "#F59E0B" }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {mode === "create" ? (
            <Info className={`h-5 w-5 ${iconColor}`} />
          ) : (
            <Lightbulb className={`h-5 w-5 ${iconColor}`} />
          )}
          {currentGuide.title}
        </CardTitle>
        <CardDescription>{currentGuide.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {currentGuide.tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className={`${mode === "create" ? "text-brand-purple" : "text-brand-amber"} font-bold`}>•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          {mode === "evaluate" ? (
            <p>✨ Evaluate any prompt instantly - no account required! Sign in only if you want to save results.</p>
          ) : (
            <p>Based on OpenAI prompt engineering best practices</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
