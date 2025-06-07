"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Lightbulb, Wand2, Database, Loader2, Lock, Globe, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { PromptGuide } from "@/components/prompt-guide"
import { createPromptInstant } from "@/app/actions/prompt-actions"
import { ensurePromptsTable } from "@/app/actions/ensure-tables"
import { useToast } from "@/components/ui/use-toast"

interface PromptBuilderProps {
  userId?: string
}

export function PromptBuilder({ userId }: PromptBuilderProps) {
  const router = useRouter()
  const [mode, setMode] = useState<"create" | "evaluate">("create")
  const [isGenerating, setIsGenerating] = useState(false)
  const [promptText, setPromptText] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCreatingTables, setIsCreatingTables] = useState(false)
  const [needsTableCreation, setNeedsTableCreation] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const { toast } = useToast()

  const handleModeToggle = (checked: boolean) => {
    setMode(checked ? "evaluate" : "create")
    setErrorMessage(null)
  }

  const handlePublicToggle = (checked: boolean) => {
    const makePrivate = checked
    
    if (makePrivate && !userId) {
      setShowLoginDialog(true)
      return
    }
    
    setIsPublic(!makePrivate)
  }

  const handleCreateTables = async () => {
    setIsCreatingTables(true)
    setErrorMessage(null)

    try {
      const result = await ensurePromptsTable()

      if (result.success) {
        toast({
          title: "Success",
          description: result.created ? "Database tables created successfully" : "Database tables already exist",
        })
        setNeedsTableCreation(false)
      } else {
        setErrorMessage(result.error || "Failed to create database tables")
        toast({
          title: "Error",
          description: result.error || "Failed to create database tables",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating tables:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setErrorMessage(errorMessage)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating tables",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTables(false)
    }
  }

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      toast({
        title: "Error",
        description: mode === "create" 
          ? "Please describe what you want to create" 
          : "Please enter a prompt",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setErrorMessage(null)

    try {
      if (mode === "create") {
        const formData = new FormData()
        formData.append("userInput", promptText)
        formData.append("mode", "create")
        formData.append("isPublic", isPublic.toString())
        if (userId) {
          formData.append("userId", userId)
        }

        const result = await createPromptInstant(formData)

        if (result.success) {
          toast({
            title: "Prompt Created!",
            description: result.wasImproved 
              ? "Your input has been improved into a professional prompt! Redirecting..."
              : "Redirecting to your prompt. Evaluation and output are being generated...",
          })
          router.push(`/prompt/${result.promptId}`)
        } else {
          if (result.error && result.error.includes("table") && result.error.includes("does not exist")) {
            setNeedsTableCreation(true)
            setErrorMessage("Database tables need to be created before you can use this feature")
          } else {
            setErrorMessage(result.error || "Failed to create prompt")
            toast({
              title: "Error",
              description: result.error || "Failed to create prompt",
              variant: "destructive",
            })
          }
        }
      } else {
        // EVALUATE mode: Create prompt immediately and redirect (same speed as generate)
        const formData = new FormData()
        formData.append("promptText", promptText)
        formData.append("mode", "evaluate")
        formData.append("isPublic", isPublic.toString())
        if (userId) {
          formData.append("userId", userId)
        }

        const result = await createPromptInstant(formData)

        if (result.success) {
          toast({
            title: "Prompt Created!",
            description: "Redirecting to your prompt. Evaluation and output are being generated...",
          })
          router.push(`/prompt/${result.promptId}`)
        } else {
          if (result.error && result.error.includes("table") && result.error.includes("does not exist")) {
            setNeedsTableCreation(true)
            setErrorMessage("Database tables need to be created before you can use this feature")
          } else {
            setErrorMessage(result.error || "Failed to create prompt")
            toast({
              title: "Error",
              description: result.error || "Failed to create prompt",
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error processing prompt:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setErrorMessage(errorMessage)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (needsTableCreation) {
    return (
      <Card className="border-2 border-brand-purple/20 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Database Schema Issue Detected</h3>
          <p className="text-muted-foreground mb-4">
            There's a schema conflict: the system confirms the table exists but can't access it during operations. This
            is often caused by case sensitivity issues or schema configuration problems.
          </p>
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <p className="font-medium">Error details:</p>
              <p>{errorMessage}</p>
            </div>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleCreateTables}
                disabled={isCreatingTables}
                className="gap-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity"
              >
                <Database className="h-4 w-4" />
                {isCreatingTables ? "Verifying..." : "Verify Tables"}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setIsCreatingTables(true)
                    const response = await fetch("/api/check-db?detailed=true")
                    const data = await response.json()

                    if (data.tables && data.tables.length > 0) {
                      setErrorMessage(`Available tables: ${data.tables.join(", ")}. 
                        Check if 'prompts' exists with exact case matching.`)
                    } else {
                      setErrorMessage("No tables found or unable to list tables. This suggests a permissions issue.")
                    }
                  } catch (error) {
                    setErrorMessage(`Diagnostic failed: ${error instanceof Error ? error.message : String(error)}`)
                  } finally {
                    setIsCreatingTables(false)
                  }
                }}
                variant="outline"
                className="gap-2"
              >
                Run Diagnostics
              </Button>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
              <p className="font-medium">Common solutions:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Check table name case sensitivity - PostgreSQL is case-sensitive with quoted identifiers</li>
                <li>Verify the search_path is set to 'public' in your database connection</li>
                <li>
                  Try running this SQL: <code>SET search_path TO public; SELECT * FROM prompts LIMIT 1;</code>
                </li>
                <li>Ensure your database user has SELECT and INSERT permissions on the prompts table</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="overflow-hidden border-2 border-brand-purple/20 shadow-lg">
          <div className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {mode === "create" ? (
                <Wand2 className="h-5 w-5 text-brand-purple" />
              ) : (
                <Lightbulb className="h-5 w-5 text-brand-amber" />
              )}
              <h3 className="font-semibold text-lg">{mode === "create" ? "Generate Prompt" : "Evaluate Prompt"}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="mode-toggle" className="text-sm cursor-pointer">
                {mode === "create" ? "Generate" : "Evaluate"}
              </Label>
              <Switch
                id="mode-toggle"
                checked={mode === "evaluate"}
                onCheckedChange={handleModeToggle}
                className="data-[state=checked]:bg-brand-amber data-[state=unchecked]:bg-brand-purple"
              />
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  <p className="font-medium">Error:</p>
                  <p>{errorMessage}</p>
                </div>
              )}
              <div>
                <Textarea
                  id="prompt-text"
                  placeholder={
                    mode === "create"
                      ? "Describe what you want to create and we'll build a professional prompt for you...\n\nExamples:\n• 'A marketing email for {{product_name}} targeting {{audience}}'\n• 'A code review checklist for {{programming_language}}'\n• 'A customer service response for {{issue_type}} complaints'\n• 'A personalized welcome message for {{name}} from {{location}}'"
                      : userId
                        ? "Paste your existing prompt here to evaluate its effectiveness and save it automatically...\n\nTip: Use {{variable_name}} for dynamic content that can be customized later."
                        : "Paste your existing prompt here to evaluate its effectiveness (no account needed)...\n\nTip: Use {{variable_name}} for dynamic content that can be customized later."
                  }
                  className="min-h-[300px] resize-y text-base p-4 border-2 focus-visible:ring-brand-purple"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                />
                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                  {mode === "create" ? (
                    <div>
                      <div>
                        💡 <strong>Create mode:</strong> Describe your idea and we'll transform it into an optimized, professional prompt with best practices applied.
                      </div>
                      <div className="mt-1 p-2 bg-brand-purple/5 rounded border border-brand-purple/10">
                        <strong>💡 Pro tip:</strong> Use double brackets like <code className="bg-brand-purple/10 px-1 rounded text-brand-purple">{"{{name}}"}</code>, <code className="bg-brand-purple/10 px-1 rounded text-brand-purple">{"{{location}}"}</code>, <code className="bg-brand-purple/10 px-1 rounded text-brand-purple">{"{{company}}"}</code> for variables in your description. We'll preserve these as customizable fields in the final prompt.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>
                        🔍 <strong>Evaluate mode:</strong> Test your existing prompt as-is. We'll analyze its effectiveness and show sample output.
                      </div>
                      <div className="mt-1 p-2 bg-brand-amber/5 rounded border border-brand-amber/10">
                        <strong>💡 Pro tip:</strong> Include variables using double brackets like <code className="bg-brand-amber/10 px-1 rounded text-brand-amber">{"{{name}}"}</code>, <code className="bg-brand-amber/10 px-1 rounded text-brand-amber">{"{{topic}}"}</code> to make your prompt reusable and dynamic.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end items-center gap-4">
                <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 min-w-[140px] justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {isPublic ? (
                          <Globe className="h-4 w-4 text-brand-teal" />
                        ) : (
                          <Lock className="h-4 w-4 text-brand-purple" />
                        )}
                        <span className="font-medium">{isPublic ? "Public" : "Private"}</span>
                      </div>
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-2">
                    <div className="flex flex-col gap-1">
                      <div
                        className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                          isPublic ? "bg-brand-teal/10 border border-brand-teal/20" : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setIsPublic(true)
                          setDropdownOpen(false)
                        }}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isPublic ? "border-brand-teal bg-brand-teal" : "border-muted-foreground"
                        }`}>
                          {isPublic && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <Globe className="h-4 w-4 text-brand-teal" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">Public</div>
                          <div className="text-xs text-muted-foreground">Anyone can view and remix</div>
                        </div>
                      </div>
                      
                      <div
                        className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                          !isPublic ? "bg-brand-purple/10 border border-brand-purple/20" : "hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          if (!userId) {
                            setDropdownOpen(false)
                            setShowLoginDialog(true)
                            return
                          }
                          setIsPublic(false)
                          setDropdownOpen(false)
                        }}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          !isPublic ? "border-brand-purple bg-brand-purple" : "border-muted-foreground"
                        }`}>
                          {!isPublic && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <Lock className="h-4 w-4 text-brand-purple" />
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            Private
                            {!userId && (
                              <span className="text-xs bg-brand-purple text-white px-1.5 py-0.5 rounded font-medium">
                                Pro
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">Build and deploy in private</div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={handleGenerate}
                  disabled={!promptText.trim() || isGenerating}
                  className="gap-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isGenerating 
                    ? "Processing..." 
                    : mode === "create" 
                      ? "Generate Prompt" 
                      : userId 
                        ? "Evaluate" 
                        : "Evaluate"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>

      <div className="md:col-span-1">
        <PromptGuide mode={mode} />
      </div>

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up Required</DialogTitle>
            <DialogDescription>
              Private prompts require an account. Sign up to create private prompts that only you can see.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLoginDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowLoginDialog(false)
                router.push('/signup')
              }}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity"
            >
              Sign Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
