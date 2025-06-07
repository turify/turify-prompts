"use client"

import Link from "next/link"
import { ArrowLeft, Copy, Download, Edit, Eye, Star, Sparkles, GitBranch, Loader2, CheckCircle, Clock, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptEvaluation } from "@/components/prompt-evaluation"
import { PromptOutput } from "@/components/prompt-output"
import { SocialShare } from "@/components/social-share"
import { PromptImprovementDialog } from "@/components/prompt-improvement-dialog"
import { SignupDialog } from "@/components/signup-dialog"
import { PreferencesDialog } from "@/components/preferences-dialog"
import { VersionDropdown } from "@/components/version-dropdown"
import { ProgressiveLoader } from "@/components/progressive-loader"
import { getPromptDetails, getPromptProcessingStatus, incrementImpressions } from "@/app/actions/prompt-actions"
import { getCurrentUser } from "@/app/actions/auth-actions"
import { useEffect, useState, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

interface ProcessingStatus {
  evaluation: boolean
  output: boolean
}

export default function PromptDetailsClientPage({ params }: { params: { id: string } }) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showImprovementDialog, setShowImprovementDialog] = useState(false)
  const [showSignupDialog, setShowSignupDialog] = useState(false)
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false)
  const [viewedVersion, setViewedVersion] = useState<any>(null)

  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    evaluation: false,
    output: false,
  })
  const [isPolling, setIsPolling] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0) // Force re-render trigger
  const [progressPercentage, setProgressPercentage] = useState(0) // Direct progress tracking
  const [initialLoadProgress, setInitialLoadProgress] = useState(0) // Initial loading progress
  const { toast } = useToast()
  
  // Centralized progress update function to prevent flickering and backwards movement
  const updateProgress = (newPercentage: number) => {
    setProgressPercentage(prev => Math.max(prev, newPercentage)) // Never go backwards
  }
  
  // Function to reset progress (used when improvements are applied)
  const resetProgress = (newPercentage: number = 0) => {
    setProgressPercentage(newPercentage) // Allow reset for improvements
  }
  
  // Use refs to track what we've already done
  const fetchedIds = useRef<Set<string>>(new Set())
  const impressionIds = useRef<Set<string>>(new Set())
  const isInitialMount = useRef(true)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollingAttemptsRef = useRef(0)

  // Function to refresh data (smart refresh - only update incomplete sections)
  const refreshData = async () => {
    if (!params?.id) return
    
    try {
      console.log("Manual refresh triggered - fetching complete fresh data")
      
      // Reset the fetched IDs to allow refetch
      fetchedIds.current.delete(params.id)
      
      // Force a complete refetch
      setLoading(true)
      const promptDetails = await getPromptDetails(params.id)
      
      if (promptDetails.success) {
        console.log("Fresh data from manual refresh:", {
          hasEvaluation: !!promptDetails.evaluation,
          hasOutput: !!promptDetails.output,
          score: promptDetails.prompt?.score
        })
        
        // Update the entire result with fresh data
        setResult(promptDetails)
        
        // Check processing status with fresh data
        const hasEvaluation = promptDetails.evaluation !== null && (
          promptDetails.evaluation.clarity_score > 0 || 
          promptDetails.evaluation.specificity_score > 0 || 
          promptDetails.evaluation.contextual_score > 0 || 
          promptDetails.evaluation.effectiveness_score > 0
        )
        const hasOutput = promptDetails.output !== null && 
          promptDetails.output.output_text && 
          promptDetails.output.output_text.trim() !== ''
        
        const currentStatus = {
          evaluation: hasEvaluation,
          output: hasOutput,
        }
        
        setProcessingStatus(currentStatus)
        
        // Update progress percentage based on completed sections
        const completedCount = [currentStatus.evaluation, currentStatus.output].filter(Boolean).length
        
        if (completedCount === 1) {
          updateProgress(50)
        } else if (completedCount === 2) {
          updateProgress(100)
        } else if (completedCount === 0) {
          resetProgress(25) // Reset to show activity when no sections are complete
        }
        
        // Force a re-render to ensure UI updates
        setForceUpdate(prev => prev + 1)
        
        // Add back to fetched IDs
        fetchedIds.current.add(params.id)
        
        // Reset processing status based on actual data to ensure consistency
        const actualStatus = {
          evaluation: hasEvaluation,
          output: hasOutput,
        }
        setProcessingStatus(actualStatus)
        console.log("Forcing processing status update:", actualStatus)
        
        // Restart polling if any section is still incomplete
        if (!hasEvaluation || !hasOutput) {
          console.log("Some sections still incomplete, restarting polling")
          if (!isPolling) {
            startPolling()
          }
        } else {
          console.log("All sections complete after refresh")
          stopPolling()
        }
        
        // Removed refresh success toast - visual feedback is sufficient
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Refresh failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    // Guard clauses to prevent duplicate fetches
    if (!params?.id) {
      console.log("No ID provided")
      return
    }

    if (fetchedIds.current.has(params.id)) {
      console.log("Already fetched this ID:", params.id)
      return
    }

    // Mark this ID as being fetched
    fetchedIds.current.add(params.id)

    try {
      setLoading(true)
      setError(null)
      
      // Start with initial loading progress
      setInitialLoadProgress(15)
      updateProgress(10)
      setTimeout(() => {
        setInitialLoadProgress(25)
        updateProgress(15)
      }, 200)
      setTimeout(() => {
        setInitialLoadProgress(35)
        updateProgress(20)
      }, 400)
      
      // Fetch both prompt details and current user
      const [promptRes, userRes] = await Promise.all([
        getPromptDetails(params.id),
        getCurrentUser()
      ])
      
      
      if (promptRes?.success && promptRes?.prompt) {
        setResult(promptRes)
        
        // Check if we need to start polling for missing sections
        const hasEvaluation = promptRes.evaluation !== null && (
          promptRes.evaluation.clarity_score > 0 || 
          promptRes.evaluation.specificity_score > 0 || 
          promptRes.evaluation.contextual_score > 0 || 
          promptRes.evaluation.effectiveness_score > 0
        )
        const hasOutput = promptRes.output !== null && 
          promptRes.output.output_text && 
          promptRes.output.output_text.trim() !== ''
        
        const currentStatus = {
          evaluation: hasEvaluation,
          output: hasOutput,
        }
        
        setProcessingStatus(currentStatus)
        
        // Initialize progress percentage with incremental loading
        const completedCount = [currentStatus.evaluation, currentStatus.output].filter(Boolean).length
        const basePercentage = (completedCount / 2) * 100
        
        // Calculate initial percentage based on completion
        if (basePercentage === 0) {
          resetProgress(Math.max(initialLoadProgress, 25)) // Use reset for incomplete sections
        } else if (completedCount === 1) {
          updateProgress(Math.max(basePercentage, 50))
        } else {
          updateProgress(100)
        }
        
        // Force re-render to ensure UI displays correctly
        setForceUpdate(prev => prev + 1)
        
        // Start polling if any section is missing
        if (!hasEvaluation || !hasOutput) {
          startPolling()
        }
        
        // Only increment impressions once per ID and only after successful fetch
        if (!impressionIds.current.has(params.id)) {
          impressionIds.current.add(params.id)
          
          // Increment impressions in background without awaiting
          incrementImpressions(params.id).catch((error) => {
            console.error("Failed to increment impressions:", error)
          })
        }
      } else {
        setError("Prompt not found or failed to load")
      }

      setCurrentUser(userRes)
    } catch (error) {
      console.error("Error fetching prompt details:", error)
      setError("Failed to load prompt details. Please try again later.")
      // Remove from fetched set on error so retry is possible
      fetchedIds.current.delete(params.id)
    } finally {
      setLoading(false)
      isInitialMount.current = false
    }
  }

  const startPolling = () => {
    if (isPolling || !params?.id) return
    
    setIsPolling(true)
    pollingAttemptsRef.current = 0
    console.log("Starting progressive polling for async processing...")
    
    // Add incremental progress during polling startup
    updateProgress(30)
    
    const poll = async () => {
      try {
        pollingAttemptsRef.current += 1
        
        // Add tiny incremental progress on each poll (only for first few attempts)
        if (pollingAttemptsRef.current <= 5) {
          updateProgress(30 + pollingAttemptsRef.current)
        }
        
        // Call server action directly to bypass any API caching
        console.log('🔍 Calling getPromptProcessingStatus directly for:', params.id)
        const statusResult = await getPromptProcessingStatus(params.id)
        
        console.log('🔍 Raw server action response:', statusResult)
        
        if (statusResult.success) {
          const newStatus = statusResult.status
          console.log('🔍 New status from server action:', newStatus)
          const prevStatus = processingStatus
          
          // Check for any newly completed sections
          const evaluationJustCompleted = !prevStatus.evaluation && newStatus.evaluation
          const outputJustCompleted = !prevStatus.output && newStatus.output
          
          // Also check if sections are complete but UI doesn't have the data
          const evaluationCompleteButMissingData = newStatus.evaluation && (!result?.evaluation || (
            result.evaluation.clarity_score === 0 && 
            result.evaluation.specificity_score === 0 && 
            result.evaluation.contextual_score === 0 && 
            result.evaluation.effectiveness_score === 0
          ))
          const outputCompleteButMissingData = newStatus.output && (!result?.output || !result.output.output_text || result.output.output_text.trim() === '')
          
          const needsDataRefresh = evaluationJustCompleted || outputJustCompleted ||
                                   evaluationCompleteButMissingData || outputCompleteButMissingData
          
          // If any section just completed OR is complete but missing data, fetch fresh data
          if (needsDataRefresh) {
            console.log("Fetching fresh data because:", {
              justCompleted: { evaluation: evaluationJustCompleted, output: outputJustCompleted },
              missingData: { evaluation: evaluationCompleteButMissingData, output: outputCompleteButMissingData }
            })
            
            try {
              // Force a complete data refresh when sections complete
              fetchedIds.current.delete(params.id)
              const promptDetails = await getPromptDetails(params.id)
              fetchedIds.current.add(params.id)
              
              if (promptDetails.success) {
                console.log("Fresh data received:", {
                  hasEvaluation: !!promptDetails.evaluation,
                  hasOutput: !!promptDetails.output,
                  score: promptDetails.prompt?.score
                })
                
                // Update the entire result state with fresh data
                setResult(promptDetails)
                
                // Removed individual section completion toasts - progress bar provides visual feedback
                
                // Force re-render to ensure UI updates
                setForceUpdate(prev => prev + 1)
              }
            } catch (updateError) {
              console.error("Error fetching fresh data:", updateError)
            }
          }
          
          // Update processing status
          setProcessingStatus(prev => {
            const updatedStatus = {
              evaluation: prev.evaluation || newStatus.evaluation,
              output: prev.output || newStatus.output,
            }
            
            // Check if sections went from complete to incomplete (improvement applied)
            const evaluationWentIncomplete = prev.evaluation && !newStatus.evaluation
            const outputWentIncomplete = prev.output && !newStatus.output
            
            if (evaluationWentIncomplete || outputWentIncomplete) {
              console.log("🔄 Improvement detected - sections went incomplete, resetting progress")
              resetProgress(10) // Start with small progress to show activity
            }
            
            // Force a re-render by updating forceUpdate counter
            setForceUpdate(current => current + 1)
            
            // Update progress percentage based on completed sections
            const completedCount = [updatedStatus.evaluation, updatedStatus.output].filter(Boolean).length
            
            if (completedCount === 1) {
              updateProgress(50)
            } else if (completedCount === 2) {
              updateProgress(100)
            }
            
            return updatedStatus
          })
          
          // If all sections are complete, stop polling
          if (newStatus.evaluation && newStatus.output) {
            
            // Do one final data refresh to ensure UI is up to date
            try {
              fetchedIds.current.delete(params.id)
              const finalDetails = await getPromptDetails(params.id)
              fetchedIds.current.add(params.id)
              
              if (finalDetails.success) {
                console.log("Final refresh data:", {
                  hasEvaluation: !!finalDetails.evaluation,
                  hasOutput: !!finalDetails.output,
                  score: finalDetails.prompt?.score
                })
                setResult(finalDetails)
                setForceUpdate(prev => prev + 1)
              }
            } catch (finalError) {
              console.error("Error in final refresh:", finalError)
            }
            
            stopPolling()
            return
          }
        }
      } catch (error) {
        console.error("Error polling status:", error)
        // Fallback to server action if API fails
        try {
          const statusResult = await getPromptProcessingStatus(params.id)
          
          if (statusResult.success) {
            const newStatus = statusResult.status
            setProcessingStatus(prev => ({
              evaluation: prev.evaluation || newStatus.evaluation,
              output: prev.output || newStatus.output,
            }))
            
            if (newStatus.evaluation && newStatus.output) {
              console.log("All sections complete (fallback), stopping polling")
              stopPolling()
              return
            }
          }
        } catch (fallbackError) {
          console.error("Fallback polling also failed:", fallbackError)
        }
      }
      
      // Progressive intervals: Start fast, then slow down
      let interval
      if (pollingAttemptsRef.current <= 5) {
        interval = 500 // 0.5 seconds for first 5 attempts (faster updates)
      } else if (pollingAttemptsRef.current <= 15) {
        interval = 1000 // 1 second for next 10 attempts
      } else if (pollingAttemptsRef.current <= 25) {
        interval = 2000 // 2 seconds for next 10 attempts
      } else {
        interval = 5000 // 5 seconds after that
      }
      
      // Stop polling after 30 attempts (about 2 minutes)
      if (pollingAttemptsRef.current >= 30) {
        console.log("Polling timeout reached, stopping")
        stopPolling()
        
        // Check if we're stuck at a specific percentage (like 35%)
        const currentProgress = Math.round(
          ((processingStatus.evaluation ? 1 : 0) + 
           (processingStatus.output ? 1 : 0)) * 100 / 2
        )
        
        if (currentProgress > 0 && currentProgress < 100) {
          // Partial completion - likely a stalling issue
          console.warn(`⚠️ Processing stalled at ${currentProgress}% - attempting recovery`)
          
          toast({
            title: "Processing appears to be stalled",
            description: `Progress stopped at ${currentProgress}%. Click 'Improve' again to retry the remaining components.`,
            variant: "destructive",
            duration: 8000,
          })
        } else if (currentProgress === 0) {
          // No progress at all - likely a complete failure
          console.warn("⚠️ No processing progress detected - complete failure")
          
          toast({
            title: "Processing failed to start",
            description: "The improvement process didn't start properly. Please try again.",
            variant: "destructive",
            duration: 8000,
          })
        } else {
          // Normal timeout message for other cases
          toast({
            title: "Processing is taking longer than expected",
            description: "The improvement is still being processed. Please refresh the page in a moment to see the results.",
            variant: "default",
          })
        }
        return
      }
      
      pollingIntervalRef.current = setTimeout(poll, interval)
    }
    
    // Start first poll immediately
    poll()
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
    pollingAttemptsRef.current = 0
  }

  useEffect(() => {
    // Only run on mount or when ID actually changes
    if (isInitialMount.current || !fetchedIds.current.has(params?.id || "")) {
              // Start with immediate visual feedback
        updateProgress(5)
      fetchData()
    }
    
    // Cleanup polling on unmount
    return () => {
      stopPolling()
    }
  }, [params?.id]) // Only depend on the ID

  // Force re-render when processing status changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1)
  }, [processingStatus.evaluation, processingStatus.output])

  // Separate effect for error toasts
  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading prompt",
        description: "Please try refreshing the page",
        variant: "destructive",
      })
    }
  }, [error]) // Removed toast from dependencies

  const handleImproveClick = () => {
    if (!currentUser) {
      setShowSignupDialog(true)
    } else {
      setShowImprovementDialog(true)
    }
  }

  const handleBackToCurrent = () => {
    setViewedVersion(null)
  }

  const handleCopyClick = () => {
    if (!currentUser) {
      // If not logged in, still process variables if they exist
      const variableRegex = /\{\{([^}]+)\}\}/g
      const hasVariables = variableRegex.test(displayedPrompt.prompt_text)
      
      if (hasVariables) {
        // Add instructions for variables
        const instructions = "Instructions:\n* Stick to the variables in the prompt\n* Remove any double brackets and use the value of the variable\n\n"
        const processedText = instructions + displayedPrompt.prompt_text
        navigator.clipboard.writeText(processedText)
        toast({
          title: "Copied with variable instructions",
          description: "Text copied with guidance for handling variables.",
        })
      } else {
        navigator.clipboard.writeText(displayedPrompt.prompt_text)
        toast({
          title: "Copied to clipboard",
          description: "Text copied successfully.",
        })
      }
      return
    }

    // For logged-in users, show preferences dialog
    setShowPreferencesDialog(true)
  }

  const handleCopyWithPreferences = (processedText: string) => {
    navigator.clipboard.writeText(processedText)
    toast({
      title: "Copied to clipboard",
      description: "Text copied with your preferences applied",
    })
  }

  if (loading) {
    return (
      <div className="container py-20">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
        </div>
      </div>
    )
  }

  if (!result?.success || !result?.prompt) {
    return (
      <div className="container py-10">
        <div className="mb-6">
          <Link href="/prompts" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explore
          </Link>
        </div>

        <Card className="border-2 border-red-300 shadow-lg">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-2xl">Prompt Not Found</CardTitle>
            <CardDescription>The prompt you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Please check the URL or go back to explore other prompts.</p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/prompts">Browse Prompts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { prompt, evaluation, output, versions } = result
  const shareUrl = `/prompt/${prompt.id}`

  // Determine what content to display based on viewed version
  const displayedPrompt = viewedVersion || prompt
  const isViewingOlderVersion = viewedVersion && viewedVersion.version_number !== Math.max(...(versions || []).map((v: any) => v.version_number))
  const currentVersion = versions && versions.length > 0 ? Math.max(...(versions as any[]).map((v: any) => v.version_number)) : 1

  const handleVersionSelect = (version: any) => {
    setViewedVersion(version)
  }

  // Enhanced content detection for debugging
  const hasValidEvaluation = evaluation && (
    evaluation.clarity_score > 0 || 
    evaluation.specificity_score > 0 || 
    evaluation.contextual_score > 0 || 
    evaluation.effectiveness_score > 0
  )
  const hasValidOutput = output?.output_text && output.output_text.trim() !== ''

  // Extract improvement suggestions from evaluation feedback
  const getImprovementSuggestions = () => {
    if (!evaluation?.feedback) return []
    
    try {
      const feedback = typeof evaluation.feedback === "string" ? JSON.parse(evaluation.feedback) : evaluation.feedback
      return feedback
        .filter((item: any) => item.category === "Improvement")
        .map((item: any, index: number) => ({
          section: "General",
          suggestion: item.message,
          priority: item.priority || "medium" // Use AI-provided priority or default to medium
        }))
    } catch (error) {
      console.error("Error parsing evaluation feedback:", error)
      return []
    }
  }

  const improvementSuggestions = getImprovementSuggestions()

  console.log("Component render state:", {
    forceUpdate,
    hasValidEvaluation,
    hasValidOutput,
    processingStatus,
    evaluation: evaluation ? "exists" : "null",
    output: output ? "exists" : "null",
  })

  // Loading components for each section
  const LoadingSection = ({ title, isReady }: { title: string; isReady: boolean }) => (
    <ProgressiveLoader title={title} isReady={isReady} />
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link href="/prompts" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Link>
      </div>

      {/* Processing Status Banner */}
      {(isPolling || !processingStatus.evaluation || !processingStatus.output) && (
        <Card key={`processing-${forceUpdate}-${JSON.stringify(processingStatus)}`} className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <div className="absolute inset-0 rounded-full border-2 border-blue-200 dark:border-blue-700"></div>
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    Generating your prompt analysis
                  </span>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                    This usually takes 5-10 seconds
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    {processingStatus.evaluation ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    )}
                    <span className={processingStatus.evaluation ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-gray-600 dark:text-gray-400"}>
                      Evaluation
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {processingStatus.output ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                    )}
                    <span className={processingStatus.output ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-gray-600 dark:text-gray-400"}>
                      Output
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={refreshData}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-600 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
            {/* Enhanced Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mb-2">
                <span className="font-medium">Progress</span>
                <span className="font-medium">
                  {progressPercentage < 100 ? 
                    `${Math.round(progressPercentage)}% complete` : 
                    "All sections complete"
                  }
                </span>
              </div>
              <div className="h-2.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden shadow-inner">
                <div
                  key={`progress-${forceUpdate}-${progressPercentage}`}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 transition-all duration-500 ease-out rounded-full"
                  style={{ 
                    width: `${progressPercentage}%` 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <Card className="border-2 border-brand-purple/20 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10">
              {isViewingOlderVersion && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 dark:bg-amber-950/50 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Viewing v{viewedVersion.version_number} (from {new Date(viewedVersion.created_at).toLocaleDateString()})
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleBackToCurrent}
                      className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-600 dark:hover:bg-amber-900/50"
                    >
                      Back to Current
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl sm:text-2xl">{prompt.title}</CardTitle>
                  <CardDescription className="mt-1">{prompt.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VersionDropdown
                    versions={versions || []}
                    currentVersion={currentVersion}
                    viewedVersion={viewedVersion}
                    onVersionSelect={handleVersionSelect}
                  />
                  <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                    <Star className="h-5 w-5 fill-brand-amber text-brand-amber" />
                    <span key={`score-${forceUpdate}`} className="font-medium text-gray-900 dark:text-gray-100">{displayedPrompt.score || "0"}/100</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center mt-2 text-xs sm:text-sm text-muted-foreground gap-x-2 gap-y-1">
                {prompt.industry && (
                  <>
                    <span className="font-medium text-brand-blue">{prompt.industry}</span>
                    <span className="hidden sm:inline">•</span>
                  </>
                )}
                <span>
                  Created on{" "}
                  {new Date(prompt.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {prompt.impressions || 0} views
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="prompt" className="mt-4">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                  <TabsTrigger
                    value="prompt"
                    className="data-[state=active]:bg-brand-purple data-[state=active]:text-white"
                  >
                    Prompt
                  </TabsTrigger>
                  <TabsTrigger
                    value="output"
                    className="data-[state=active]:bg-brand-blue data-[state=active]:text-white"
                  >
                    Output
                  </TabsTrigger>
                  <TabsTrigger
                    value="evaluation"
                    className="data-[state=active]:bg-brand-teal data-[state=active]:text-white"
                  >
                    Evaluation
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="prompt" className="space-y-4 sm:space-y-6 pt-4">
                  <div className="rounded-md bg-muted/50 p-3 sm:p-4 border border-muted">
                    <p className="whitespace-pre-wrap">{displayedPrompt.prompt_text}</p>
                  </div>
                </TabsContent>
                <TabsContent value="output" className="pt-4">
                  {hasValidOutput ? (
                    <PromptOutput key={`output-${forceUpdate}`} output={output.output_text} />
                  ) : (
                    <LoadingSection title="Output" isReady={processingStatus.output} />
                  )}
                </TabsContent>
                <TabsContent value="evaluation" className="pt-4">
                  {hasValidEvaluation ? (
                    <PromptEvaluation 
                      key={`eval-${forceUpdate}`} 
                      evaluation={evaluation} 
                      prompt={prompt}
                    />
                  ) : (
                    <LoadingSection title="Evaluation" isReady={processingStatus.evaluation} />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <Card className="border-2 border-brand-blue/20 shadow-md">
            <CardHeader className="bg-gradient-to-r from-brand-blue/10 to-brand-teal/10">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Button
                className="w-full justify-start bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 text-white border-0"
                onClick={handleCopyClick}
              >
                <Copy className="mr-2 h-4 w-4" />
                Use Prompt
              </Button>
              
              <Button
                className="w-full justify-start bg-gradient-to-r from-brand-blue to-brand-teal hover:opacity-90 text-white border-0"
                onClick={handleImproveClick}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {currentUser && currentUser.id === prompt.user_id ? "Improve This Prompt" : "Copy & Improve This Prompt"}
              </Button>
              
              <Button
                className="w-full justify-start bg-white dark:bg-gray-800 text-foreground hover:bg-muted/80 border border-border"
                variant="outline"
                onClick={() => {
                  const promptData = {
                    title: prompt.title,
                    description: prompt.description,
                    prompt_text: prompt.prompt_text,
                    industry: prompt.industry,
                    created_at: prompt.created_at,
                  }

                  const blob = new Blob([JSON.stringify(promptData, null, 2)], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${prompt.title.replace(/\s+/g, "-").toLowerCase()}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="mr-2 h-4 w-4 text-brand-blue" />
                Export (.json)
              </Button>
              <SocialShare
                url={shareUrl}
                title={prompt.title}
                description={prompt.description || `A prompt with score ${prompt.score}/100`}
                className="w-full justify-start bg-white dark:bg-gray-800 text-foreground hover:bg-muted/80 border border-border"
                variant="outline"
              />

            </CardContent>
          </Card>


        </div>
      </div>

      {/* Dialogs */}
      <PromptImprovementDialog
        open={showImprovementDialog}
        onOpenChange={setShowImprovementDialog}
        prompt={displayedPrompt}
        suggestions={improvementSuggestions}
        currentUser={currentUser}
        versions={versions}
        onVersionCreated={refreshData}
      />

      <SignupDialog
        open={showSignupDialog}
        onOpenChange={setShowSignupDialog}
        promptTitle={prompt?.title}
      />

      <PreferencesDialog
        open={showPreferencesDialog}
        onOpenChange={setShowPreferencesDialog}
        promptText={displayedPrompt.prompt_text}
        currentUser={currentUser}
        onCopyWithPreferences={handleCopyWithPreferences}
      />
    </div>
  )
}