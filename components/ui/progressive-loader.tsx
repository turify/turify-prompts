"use client"

import { Loader2, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressiveLoaderProps {
  title: string
  isReady: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ProgressiveLoader({ 
  title, 
  isReady, 
  className,
  size = "md" 
}: ProgressiveLoaderProps) {
  const sizeClasses = {
    sm: "py-4",
    md: "py-8", 
    lg: "py-12"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <div className={cn(
      "flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      <div className="flex items-center gap-3">
        {isReady ? (
          <CheckCircle className={cn(iconSizes[size], "text-green-500")} />
        ) : (
          <Loader2 className={cn(iconSizes[size], "animate-spin text-brand-purple")} />
        )}
        <span className={cn(
          "text-muted-foreground font-medium",
          size === "sm" && "text-sm",
          size === "md" && "text-sm",
          size === "lg" && "text-base"
        )}>
          {isReady ? `${title} ready` : `Generating ${title.toLowerCase()}...`}
        </span>
      </div>
    </div>
  )
}

interface ProcessingStatusIndicatorProps {
  sections: Array<{
    name: string
    isReady: boolean
  }>
  className?: string
}

export function ProcessingStatusIndicator({ 
  sections, 
  className 
}: ProcessingStatusIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      {sections.map((section) => (
        <div key={section.name} className="flex items-center gap-1">
          {section.isReady ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <Clock className="h-4 w-4 text-gray-400" />
          )}
          <span className={section.isReady ? "text-green-700" : "text-gray-500"}>
            {section.name}
          </span>
        </div>
      ))}
    </div>
  )
} 