"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Settings, Sparkles, Plus, X, AlertCircle, Edit, Trash2, ExternalLink } from "lucide-react"

interface PreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promptText: string
  currentUser: any
  onCopyWithPreferences: (processedText: string) => void
}

interface Variable {
  name: string
  value: string
  matched?: boolean
}

interface VariableMatch {
  original: string
  suggested: string
  confidence: number
}

interface EditPreferenceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preferenceKey: string
  preferenceValue: string
  onSave: (key: string, value: string) => void
  onDelete: (key: string) => void
}

function EditPreferenceDialog({
  open,
  onOpenChange,
  preferenceKey,
  preferenceValue,
  onSave,
  onDelete,
}: EditPreferenceDialogProps) {
  const [editKey, setEditKey] = useState(preferenceKey)
  const [editValue, setEditValue] = useState(preferenceValue)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  // LLM providers configuration
  const llmProviders = [
    {
      name: "ChatGPT",
      url: "https://chat.openai.com",
      icon: "🤖",
      description: "OpenAI's ChatGPT"
    },
    {
      name: "Claude",
      url: "https://claude.ai",
      icon: "🧠",
      description: "Anthropic's Claude"
    },
    {
      name: "Gemini",
      url: "https://gemini.google.com",
      icon: "✨",
      description: "Google's Gemini"
    },
    {
      name: "Deepseek",
      url: "https://chat.deepseek.com",
      icon: "🔮",
      description: "Deepseek Chat"
    },
    {
      name: "Perplexity",
      url: "https://perplexity.ai",
      icon: "🔍",
      description: "Perplexity AI"
    },
    {
      name: "Cohere",
      url: "https://coral.cohere.com",
      icon: "🌊",
      description: "Cohere Chat"
    },
    {
      name: "Mistral",
      url: "https://chat.mistral.ai",
      icon: "🌪️",
      description: "Mistral AI"
    },
    {
      name: "Groq",
      url: "https://groq.com",
      icon: "⚡",
      description: "Groq AI"
    }
  ]

  useEffect(() => {
    if (open) {
      setEditKey(preferenceKey)
      setEditValue(preferenceValue)
      setIsDeleting(false)
    }
  }, [open, preferenceKey, preferenceValue])

  const handleSave = () => {
    if (!editKey.trim()) {
      toast({
        title: "Error",
        description: "Variable name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    onSave(editKey.trim(), editValue)
    onOpenChange(false)
  }

  const handleDelete = () => {
    onDelete(preferenceKey)
    onOpenChange(false)
  }

  const isLLMProvider = preferenceKey === '__llm_provider'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-brand-purple" />
            Edit Preference
          </DialogTitle>
          <DialogDescription>
            Modify or delete this preference variable.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-key">Variable Name</Label>
            <Input
              id="edit-key"
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              placeholder="e.g., target_audience"
              className="text-sm"
              disabled={isLLMProvider}
            />
          </div>

          <div>
            <Label htmlFor="edit-value">Value</Label>
            {isLLMProvider ? (
              <Select value={editValue} onValueChange={setEditValue}>
                <SelectTrigger id="edit-value">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {llmProviders.find(p => p.name === editValue)?.icon}
                      </span>
                      <span>{editValue}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {llmProviders.map((provider) => (
                    <SelectItem key={provider.name} value={provider.name}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{provider.icon}</span>
                        <div>
                          <div className="font-medium">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">{provider.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Textarea
                id="edit-value"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Enter the value for this variable"
                className="min-h-[100px] text-sm"
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setIsDeleting(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90">
            <Settings className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Preference</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{preferenceKey}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleting(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

export function PreferencesDialog({
  open,
  onOpenChange,
  promptText,
  currentUser,
  onCopyWithPreferences,
}: PreferencesDialogProps) {
  const [variables, setVariables] = useState<Variable[]>([])
  const [userPreferences, setUserPreferences] = useState<Record<string, string>>({})
  const [selectedProvider, setSelectedProvider] = useState("ChatGPT")
  const [isProcessing, setIsProcessing] = useState(false)
  const [variableMatches, setVariableMatches] = useState<VariableMatch[]>([])
  const [activeTab, setActiveTab] = useState("variables")
  const [editDialog, setEditDialog] = useState(false)
  const [editingPreference, setEditingPreference] = useState({ key: "", value: "" })
  const { toast } = useToast()

  // LLM providers configuration
  const llmProviders = [
    {
      name: "ChatGPT",
      url: "https://chat.openai.com",
      icon: "🤖",
      description: "OpenAI's ChatGPT"
    },
    {
      name: "Claude",
      url: "https://claude.ai",
      icon: "🧠",
      description: "Anthropic's Claude"
    },
    {
      name: "Gemini",
      url: "https://gemini.google.com",
      icon: "✨",
      description: "Google's Gemini"
    },
    {
      name: "Deepseek",
      url: "https://chat.deepseek.com",
      icon: "🔮",
      description: "Deepseek Chat"
    },
    {
      name: "Perplexity",
      url: "https://perplexity.ai",
      icon: "🔍",
      description: "Perplexity AI"
    },
    {
      name: "Cohere",
      url: "https://coral.cohere.com",
      icon: "🌊",
      description: "Cohere Chat"
    },
    {
      name: "Mistral",
      url: "https://chat.mistral.ai",
      icon: "🌪️",
      description: "Mistral AI"
    },
    {
      name: "Groq",
      url: "https://groq.com",
      icon: "⚡",
      description: "Groq AI"
    }
  ]

  // Extract variables from prompt text
  const extractVariables = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g
    const matches = []
    let match
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim())
    }
    
    return [...new Set(matches)] // Remove duplicates
  }

  // Load user preferences and extract variables when dialog opens
  useEffect(() => {
    if (open && promptText && currentUser) {
      loadPreferencesAndSetupVariables()
    }
  }, [open, promptText, currentUser])

  // Load preferences from API and setup variables
  const loadPreferencesAndSetupVariables = async () => {
    try {
      setIsProcessing(true)
      
      // Fetch latest preferences from API
      const response = await fetch('/api/user/preferences')
      let preferences: Record<string, string> = {}
      
      if (response.ok) {
        const data = await response.json()
        preferences = data.preferences || {}
      } else {
        // Fallback to currentUser preferences if API fails
        preferences = currentUser?.preferences || {}
      }
      
      setUserPreferences(preferences)
      
      // Set LLM provider from preferences or default to ChatGPT
      setSelectedProvider(preferences['__llm_provider'] || "ChatGPT")
      
      const extractedVars = extractVariables(promptText)
      
      // Create variables array with existing preferences (exact matches first)
      const varsWithPrefs = extractedVars.map(varName => ({
        name: varName,
        value: preferences[varName] || "",
        matched: false,
      }))

      setVariables(varsWithPrefs)
      
      // Check for variable matches if user has preferences and there are unmatched variables
      if (Object.keys(preferences).length > 0) {
        const unmatchedVars = extractedVars.filter(varName => !preferences[varName])
        if (unmatchedVars.length > 0) {
          await checkVariableMatches(unmatchedVars, preferences, varsWithPrefs)
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      // Fallback to basic setup
      const extractedVars = extractVariables(promptText)
      const preferences: Record<string, string> = currentUser?.preferences || {}
      const varsWithPrefs = extractedVars.map(varName => ({
        name: varName,
        value: preferences[varName] || "",
        matched: false,
      }))
      setVariables(varsWithPrefs)
      setUserPreferences(preferences)
      setSelectedProvider(preferences['__llm_provider'] || "ChatGPT")
    } finally {
      setIsProcessing(false)
    }
  }

  // Check for similar variables using AI
  const checkVariableMatches = async (
    extractedVars: string[], 
    preferences: Record<string, string>, 
    currentVars: Variable[]
  ) => {
    try {
      const response = await fetch('/api/match-variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedVariables: extractedVars,
          userPreferences: preferences,
        }),
      })

      if (response.ok) {
        const matches = await response.json()
        setVariableMatches(matches)
        
        // Auto-apply high confidence matches
        const updatedVars = currentVars.map(variable => {
          const match = matches.find((m: VariableMatch) => m.original === variable.name)
          if (match && match.confidence > 0.8) {
            return {
              ...variable,
              value: preferences[match.suggested] || variable.value,
              matched: true,
            }
          }
          return variable
        })
        setVariables(updatedVars)
      }
    } catch (error) {
      console.error('Error matching variables:', error)
    }
  }

  // Update variable value
  const updateVariable = (index: number, value: string) => {
    const updated = [...variables]
    updated[index].value = value
    setVariables(updated)
  }

  // Handle preference edit
  const handleEditPreference = (key: string, value: string) => {
    setEditingPreference({ key, value })
    setEditDialog(true)
  }

  // Save edited preference
  const handleSavePreference = async (newKey: string, newValue: string) => {
    try {
      const updatedPreferences = { ...userPreferences }
      
      // If key changed, remove old key
      if (newKey !== editingPreference.key) {
        delete updatedPreferences[editingPreference.key]
      }
      
      // Set new value
      updatedPreferences[newKey] = newValue
      
      // Save to API
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedPreferences }),
      })
      
      if (response.ok) {
        setUserPreferences(updatedPreferences)
        toast({
          title: "Preference updated",
          description: `${newKey} has been saved.`,
        })
      } else {
        throw new Error('Failed to save preference')
      }
    } catch (error) {
      console.error('Error saving preference:', error)
      toast({
        title: "Error",
        description: "Failed to save preference. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete preference
  const handleDeletePreference = async (key: string) => {
    try {
      const updatedPreferences = { ...userPreferences }
      delete updatedPreferences[key]
      
      // Save to API
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: updatedPreferences }),
      })
      
      if (response.ok) {
        setUserPreferences(updatedPreferences)
        toast({
          title: "Preference deleted",
          description: `${key} has been removed.`,
        })
      } else {
        throw new Error('Failed to delete preference')
      }
    } catch (error) {
      console.error('Error deleting preference:', error)
      toast({
        title: "Error",
        description: "Failed to delete preference. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save preferences and copy text with LLM provider
  const handleCopyWithPreferences = async () => {
    try {
      setIsProcessing(true)

      // Create preferences object including LLM provider
      const newPreferences: Record<string, string> = {
        '__llm_provider': selectedProvider
      }
      variables.forEach(variable => {
        if (variable.name && variable.value) {
          newPreferences[variable.name] = variable.value
        }
      })

      // Save preferences to user account
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPreferences }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      // Replace variables with ((variable:value)) format for enhanced LLM context
      let processedText = promptText
      const filledVariables = variables.filter(v => v.name && v.value)
      variables.forEach(variable => {
        if (variable.name && variable.value) {
          const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g')
          processedText = processedText.replace(regex, `((${variable.name}:${variable.value}))`)
        }
      })

      // Add instructions if variables exist
      if (filledVariables.length > 0) {
        const instructions = "Instructions:\n* Stick to the variables in the prompt\n* Remove any double brackets and use the value of the variable\n\n"
        processedText = instructions + processedText
      }

      // Copy to clipboard
      navigator.clipboard.writeText(processedText)
      
      // Open selected LLM provider
      const provider = llmProviders.find(p => p.name === selectedProvider)
      if (provider) {
        window.open(provider.url, '_blank', 'noopener,noreferrer')
      }
      
      onOpenChange(false)

      toast({
        title: "Enhanced prompt ready!",
        description: filledVariables.length > 0 
          ? `Text with inline variables copied and ${selectedProvider} opened.`
          : `Text copied and ${selectedProvider} opened.`,
      })

    } catch (error) {
      console.error('Error applying preferences:', error)
      toast({
        title: "Error",
        description: "Failed to apply preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Copy raw text without processing variables but save any filled variables
  const handleCopyRaw = async () => {
    try {
      // Save any filled preferences before copying raw text
      const filledVariables = variables.filter(v => v.name && v.value)
      
      if (filledVariables.length > 0 || selectedProvider !== "ChatGPT") {
        const newPreferences: Record<string, string> = {
          '__llm_provider': selectedProvider
        }
        filledVariables.forEach(variable => {
          newPreferences[variable.name] = variable.value
        })

        // Save preferences to user account (don't wait for response)
        fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preferences: newPreferences }),
        }).catch(error => {
          console.error('Error saving preferences:', error)
        })
      }

      // Replace variables with ((variable:value)) format for raw copy
      let processedText = promptText
      variables.forEach(variable => {
        if (variable.name && variable.value) {
          const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g')
          processedText = processedText.replace(regex, `((${variable.name}:${variable.value}))`)
        }
      })

      // Add instructions if variables exist
      if (filledVariables.length > 0) {
        const instructions = "Instructions:\n* Stick to the variables in the prompt\n* Remove any double brackets and use the value of the variable\n\n"
        processedText = instructions + processedText
      }

      // Copy processed text to clipboard
      navigator.clipboard.writeText(processedText)
      onOpenChange(false)
      
      toast({
        title: "Text copied with inline variables",
        description: filledVariables.length > 0 
          ? `Text copied with ${filledVariables.length} variable(s) in ((name:value)) format.`
          : "Text copied as-is.",
      })
    } catch (error) {
      console.error('Error copying text:', error)
      // Even in error case, check if there are variables and add instructions
      const variableRegex = /\{\{([^}]+)\}\}/g
      const hasVariables = variableRegex.test(promptText)
      
      if (hasVariables) {
        const instructions = "Instructions:\n* Stick to the variables in the prompt\n* Remove any double brackets and use the value of the variable\n\n"
        const fallbackText = instructions + promptText
        navigator.clipboard.writeText(fallbackText)
        toast({
          title: "Copied with variable instructions",
          description: "Text copied with guidance for handling variables.",
        })
      } else {
        navigator.clipboard.writeText(promptText)
        toast({
          title: "Copied to clipboard",
          description: "Text copied.",
        })
      }
      onOpenChange(false)
    }
  }

  const hasVariables = variables.length > 0
  const hasFilledVariables = variables.some(v => v.name && v.value)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand-purple" />
              Use Prompt
            </DialogTitle>
            <DialogDescription>
              Apply your saved variables to customize the prompt before copying.
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="variables">
                Variables ({variables.filter(v => !v.matched).length})
              </TabsTrigger>
              <TabsTrigger value="preferences">
                My Preferences ({Object.keys(userPreferences).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="variables" className="flex-1 overflow-hidden space-y-4">
              {hasVariables ? (
                <div className="space-y-4">
                  {variableMatches.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Smart Matches Found
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        We found similar variables in your preferences and applied high-confidence matches automatically.
                      </p>
                    </div>
                  )}

                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                    {/* LLM Provider Selection */}
                    <div className="flex items-center gap-4 p-2 border rounded-md hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-brand-purple/60"></div>
                        <Label className="text-sm font-medium text-foreground/90">
                          LLM Provider
                        </Label>
                      </div>
                      
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger className="flex-1 border-0 bg-muted/50 focus:bg-background focus:ring-1 focus:ring-brand-purple/50 transition-all">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {llmProviders.find(p => p.name === selectedProvider)?.icon}
                              </span>
                              <span>{selectedProvider}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {llmProviders.map((provider) => (
                            <SelectItem key={provider.name} value={provider.name}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{provider.icon}</span>
                                <div>
                                  <div className="font-medium">{provider.name}</div>
                                  <div className="text-xs text-muted-foreground">{provider.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {variables.map((variable, index) => (
                      <div key={index} className="flex items-center gap-4 p-2 border rounded-md hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-brand-purple/60"></div>
                          <Label className="text-sm font-medium text-foreground/90">
                            {variable.name}
                          </Label>
                          {variable.matched && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              ✨
                            </Badge>
                          )}
                        </div>
                        
                        <Textarea
                          placeholder={`Enter ${variable.name}...`}
                          value={variable.value}
                          onChange={(e) => updateVariable(index, e.target.value)}
                          className="min-h-[36px] text-sm flex-1 resize-none border-0 bg-muted/50 focus:bg-background focus:ring-1 focus:ring-brand-purple/50 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                    {/* LLM Provider Selection - also show when no variables */}
                    <div className="flex items-center gap-4 p-2 border rounded-md hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 min-w-[120px] flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-brand-purple/60"></div>
                        <Label className="text-sm font-medium text-foreground/90">
                          LLM Provider
                        </Label>
                      </div>
                      
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger className="flex-1 border-0 bg-muted/50 focus:bg-background focus:ring-1 focus:ring-brand-purple/50 transition-all">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {llmProviders.find(p => p.name === selectedProvider)?.icon}
                              </span>
                              <span>{selectedProvider}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {llmProviders.map((provider) => (
                            <SelectItem key={provider.name} value={provider.name}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{provider.icon}</span>
                                <div>
                                  <div className="font-medium">{provider.name}</div>
                                  <div className="text-xs text-muted-foreground">{provider.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No variables found in this prompt.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Variables use double brackets like <code className="bg-muted px-1 rounded">{"{{name}}"}</code> or <code className="bg-muted px-1 rounded">{"{{company}}"}</code>
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preferences" className="flex-1 overflow-y-auto">
              {Object.keys(userPreferences).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(userPreferences).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Label className="text-sm font-medium">{key}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPreference(key, value)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No saved preferences yet. Fill in variables to save them for future use.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Separator />

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCopyRaw}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Prompt
            </Button>
            <Button
              onClick={handleCopyWithPreferences}
              disabled={isProcessing}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Use in {selectedProvider}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditPreferenceDialog
        open={editDialog}
        onOpenChange={setEditDialog}
        preferenceKey={editingPreference.key}
        preferenceValue={editingPreference.value}
        onSave={handleSavePreference}
        onDelete={handleDeletePreference}
      />
    </>
  )
} 