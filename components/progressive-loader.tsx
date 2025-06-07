"use client"

import { Loader2, CheckCircle } from "lucide-react"

interface ProgressiveLoaderProps {
  title: string
  isReady: boolean
}

export function ProgressiveLoader({ title, isReady }: ProgressiveLoaderProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3">
        {isReady ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-brand-purple" />
        )}
        <span className="text-sm text-muted-foreground font-medium">
          {isReady ? `${title} ready` : `Generating ${title.toLowerCase()}...`}
        </span>
      </div>
    </div>
  )
} 