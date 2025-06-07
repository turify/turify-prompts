import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PromptCardSkeleton() {
  return (
    <Card className="border-2 border-gray-200 dark:border-gray-700 h-48 flex flex-col bg-card dark:bg-slate-800/50 backdrop-blur-sm">
      <CardContent className="p-2 flex flex-col h-full">
        {/* Header with title and score */}
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full ml-2" />
        </div>

        {/* Industry and Version badges */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>

        {/* Description/Preview */}
        <div className="flex-1 mb-1.5">
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-4/5 mb-1" />
          <Skeleton className="h-3 w-3/5" />
        </div>

        {/* Footer with stats and button */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          
          <Skeleton className="w-full h-6 rounded" />
        </div>
      </CardContent>
    </Card>
  )
} 