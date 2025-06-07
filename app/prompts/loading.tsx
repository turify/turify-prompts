import { Skeleton } from "@/components/ui/skeleton"
import { PromptCardSkeleton } from "@/components/prompt-card-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto mb-8" />

          {/* Search and Create Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <div className="relative flex-1 w-full">
              <Skeleton className="w-full h-12 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-card rounded-lg shadow-sm border p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-32 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded" />
              <Skeleton className="h-9 w-20 rounded" />
              <Skeleton className="h-9 w-20 rounded" />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-5 w-48" />
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-border">
          <Skeleton className="h-10 w-20 rounded" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}
