"use client"

import { useState, useEffect } from "react"
import { Sparkles, Lightbulb, User, GitBranch, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { improvePromptInstant } from "@/app/actions/prompt-actions"
import { useRouter } from "next/navigation"

interface PromptImprovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: any
  suggestions?: any[]
  currentUser?: any
  versions?: any[]
  onVersionCreated?: () => Promise<void>
}

export function PromptImprovementDialog({
  open,
  onOpenChange,
  prompt,
  suggestions = [],
  currentUser,
  versions,
  onVersionCreated,
}: PromptImprovementDialogProps) {
  const [improvementInput, setImprovementInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState("improve")
  const [hasAppliedSuggestions, setHasAppliedSuggestions] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const isOwner = currentUser?.id === prompt?.user_id
  const actionType = isOwner ? "version" : "fork"

  // Function to clean up repetitive/messy prompts
  const cleanUpPrompt = (promptText: string): string => {
    let cleaned = promptText
    
    // Remove repetitive context sections
    cleaned = cleaned.replace(/(\n\nContext: Please provide comprehensive information with relevant background details\.){2,}/g, '\n\nContext: Please provide comprehensive information with relevant background details.')
    
    // Remove repetitive example requests
    cleaned = cleaned.replace(/(\n\nPlease include relevant examples to illustrate your points\.){2,}/g, '\n\nPlease include relevant examples to illustrate your points.')
    
    // Remove repetitive guidance requests
    cleaned = cleaned.replace(/(\n\nPlease be specific and provide clear, actionable guidance\.){2,}/g, '\n\nPlease be specific and provide clear, actionable guidance.')
    
    // Remove repetitive additional guidance sections
    cleaned = cleaned.replace(/(\n\nAdditional guidance: [^\n]*\n\nPlease include relevant examples[^\n]*\n\nContext: [^\n]*\n\nPlease be specific[^\n]*){1,}/g, '')
    
    // Clean up excessive whitespace
    cleaned = cleaned.replace(/\n\n\n+/g, '\n\n').trim()
    
    return cleaned
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open && prompt) {
      setImprovementInput("")
      setSelectedSuggestions(new Set())
      setActiveTab("improve")
      setHasAppliedSuggestions(false)
    }
  }, [open, prompt])

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedSuggestions(newSelected)
  }

  const applySuggestions = () => {
    console.log("applySuggestions called with:", {
      selectedSuggestions: Array.from(selectedSuggestions),
      suggestionsLength: suggestions.length
    })
    
    if (selectedSuggestions.size === 0) {
      toast({
        title: "No Suggestions Selected",
        description: "Please select at least one suggestion to apply.",
        variant: "destructive",
      })
      return
    }
    
    // Mark that suggestions have been applied
    setHasAppliedSuggestions(true)
    setActiveTab("improve") // Switch to improve tab to show the input field
    
    toast({
      title: "Suggestions Selected!",
      description: `${selectedSuggestions.size} suggestion${selectedSuggestions.size > 1 ? 's' : ''} will be applied when you save.`,
    })
  }

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to copy or improve prompts.",
        variant: "destructive",
      })
      return
    }

    // For owners, require improvements before allowing save
    if (isOwner && !hasAppliedSuggestions && !improvementInput.trim()) {
      toast({
        title: "Improvements Required",
        description: "Please add improvements or apply AI suggestions before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // For non-owners: consider it an improvement if they've applied suggestions OR typed something in the improvement input
      // For owners: consider it an improvement if they've applied suggestions OR typed improvements
      const isImprovement = isOwner ? (hasAppliedSuggestions || improvementInput.trim().length > 0) : (hasAppliedSuggestions || improvementInput.trim().length > 0)
      
      console.log("🔍 DIALOG DEBUG: Form submission values:", {
        isOwner,
        hasAppliedSuggestions,
        improvementInput: `"${improvementInput}"`,
        improvementInputTrimmed: `"${improvementInput.trim()}"`,
        improvementInputLength: improvementInput.length,
        isImprovement,
        actionType,
        selectedSuggestionsCount: selectedSuggestions.size
      })
      
      const formData = new FormData()
      formData.append("originalPromptId", prompt.id)
      formData.append("improvedPromptText", prompt.prompt_text || "") // Send original prompt text - backend will improve it
      formData.append("improvementNotes", improvementInput.trim()) // Use improvement input as notes
      formData.append("userId", currentUser.id)
      formData.append("actionType", actionType)
      formData.append("isImprovement", isImprovement.toString())
      
      // Add selected suggestions as context
      if (selectedSuggestions.size > 0) {
        const selectedSuggestionTexts = Array.from(selectedSuggestions).map(
          index => suggestions[index]?.suggestion
        ).filter(Boolean)
        formData.append("appliedSuggestions", JSON.stringify(selectedSuggestionTexts))
      }

      const result = await improvePromptInstant(formData)

      if (result.success) {
        // Close dialog immediately 
        onOpenChange(false)
        
        toast({
          title: isOwner 
            ? (isImprovement ? "Improving Prompt!" : "Saving Prompt!")
            : (isImprovement ? "Creating Improved Prompt!" : "Copying Prompt!"),
          description: isOwner
            ? (isImprovement ? "Processing improvements..." : "Prompt saved successfully!")
            : (isImprovement 
                ? "Redirecting to your improved prompt. Processing evaluation, output, and recommendations..." 
                : "Redirecting to your copied prompt with all evaluation data..."),
        })
        
        // Small delay to ensure state updates, then redirect
        setTimeout(() => {
          console.log("Redirecting to prompt:", result.promptId)
          router.push(`/prompt/${result.promptId}`)
        }, 100)
        
        // Optional: Refresh data if callback provided (but don't wait for it)
        if (onVersionCreated) {
          onVersionCreated().catch(console.error)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to improve prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {isOwner ? (
              <GitBranch className="h-5 w-5 text-brand-purple" />
            ) : (
              <Sparkles className="h-5 w-5 text-brand-amber" />
            )}
            <DialogTitle>
              {isOwner ? "Improve Prompt" : "Copy & Improve This Prompt"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isOwner 
              ? "Improve your prompt with AI suggestions or custom changes"
              : (hasAppliedSuggestions || improvementInput.trim()
                  ? "Create your own improved version of this prompt" 
                  : "Create a copy of this prompt with all evaluation data")
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="improve">Improvements</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions ({suggestions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="improve" className="space-y-4">
            {hasAppliedSuggestions && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Suggestions Applied</span>
                </div>
                <p className="text-xs text-green-700">
                  {selectedSuggestions.size} AI suggestion{selectedSuggestions.size > 1 ? 's' : ''} will be applied when you save. The improved prompt will be generated automatically.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="improvement-input">Improvements</Label>
              <Textarea
                id="improvement-input"
                placeholder="Describe what improvements you want to make to this prompt..."
                value={improvementInput}
                onChange={(e) => setImprovementInput(e.target.value)}
                className="min-h-[200px] text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Describe specific improvements you want to make. This will be combined with the original prompt and any applied suggestions.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {isOwner ? (
                  <User className="h-4 w-4 text-brand-purple" />
                ) : (
                  <GitBranch className="h-4 w-4 text-brand-amber" />
                )}
                <span className="font-medium text-sm">
                  {isOwner ? "You own this prompt" : "You don't own this prompt"}
                </span>
                {isOwner && versions && versions.length > 0 && (
                  <span className="text-xs bg-brand-teal/10 text-brand-teal px-2 py-1 rounded-full">
                    Currently v{Math.max(...(versions as any[]).map((v: any) => v.version_number))}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isOwner 
                  ? "This will update your prompt with improvements. You can apply AI suggestions or describe custom changes."
                  : (hasAppliedSuggestions || improvementInput.trim()
                      ? "This will create an improved prompt under your account, giving credit to the original creator."
                      : "This will copy the prompt and all associated evaluation data to your account, giving credit to the original creator.")
                }
              </p>
              {isOwner && !hasAppliedSuggestions && !improvementInput.trim() && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
                  💡 Add improvements or apply AI suggestions to save changes to your prompt.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {suggestions.length > 0 ? (
              <>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Select suggestions to apply ({selectedSuggestions.size} selected)
                  </p>
                  {selectedSuggestions.size > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={applySuggestions}
                      className="bg-gradient-to-r from-brand-purple to-brand-blue text-white border-0 hover:opacity-90"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Apply {selectedSuggestions.size} & Review
                    </Button>
                  )}
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all ${
                        selectedSuggestions.has(index) 
                          ? 'ring-2 ring-brand-purple bg-brand-purple/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleSuggestion(index)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSuggestions.has(index)}
                              onChange={() => toggleSuggestion(index)}
                              className="rounded"
                            />
                            <CardTitle className="text-sm capitalize">
                              {suggestion.section || 'General'}
                            </CardTitle>
                          </div>
                          <Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority || 'Medium'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm">{suggestion.suggestion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No AI suggestions available for this prompt.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {activeTab === "improve" && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (isOwner && !hasAppliedSuggestions && !improvementInput.trim())}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : isOwner ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve Prompt
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {hasAppliedSuggestions || improvementInput.trim() ? "Copy & Improve" : "Copy"}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 