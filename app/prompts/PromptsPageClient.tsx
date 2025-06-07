"use client"

import Link from "next/link"
import { Search, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PromptCard } from "@/components/prompt-card"
import { PromptCardSkeleton } from "@/components/prompt-card-skeleton"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useState } from "react"

interface PromptPageProps {
  searchParams: { page?: string; industry?: string; minScore?: string; search?: string }
}

export default function PromptsPageClient({ searchParams }: PromptPageProps) {
  const router = useRouter()
  const [prompts, setPrompts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<{ total: number; page: number; pageSize: number; totalPages: number }>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  })
  const [searchValue, setSearchValue] = useState(searchParams.search || "")
  
  const page = Number.parseInt(searchParams.page || "1")
  const industry = searchParams.industry
  const minScore = searchParams.minScore ? Number.parseInt(searchParams.minScore) : undefined
  const searchTerm = searchParams.search

  useEffect(() => {
    const fetchPrompts = async () => {
      setIsLoading(true)
      const result = await getFilteredPrompts(page, 10, industry, minScore, searchTerm)

      if (result.success) {
        setPrompts(result.prompts)
        setPagination(result.pagination)
      } else {
        setPrompts([])
        setPagination({ total: 0, page: 1, pageSize: 10, totalPages: 0 })
      }
      setIsLoading(false)
    }

    fetchPrompts()
  }, [page, industry, minScore, searchTerm])

  // Update search value when searchParams change
  useEffect(() => {
    setSearchValue(searchParams.search || "")
  }, [searchParams.search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (searchValue.trim()) {
      params.set("search", searchValue.trim())
    }
    if (industry) params.set("industry", industry)
    if (minScore) params.set("minScore", minScore.toString())
    
    router.push(`/prompts?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Discover AI Prompts</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our curated collection of high-quality prompts created by the community
          </p>

          {/* Search and Create Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <form onSubmit={handleSearch} className="w-full">
                <Input
                  type="search"
                  placeholder="Search prompts..."
                  className="w-full pl-10 h-12 text-base"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </form>
            </div>
            <Link href="/">
              <Button className="h-12 px-6 bg-gradient-to-r from-brand-blue to-brand-teal hover:opacity-90 text-white font-medium">Create Prompt</Button>
            </Link>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-card rounded-lg shadow-sm border p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-card-foreground">Filter by:</span>

            {/* Industry Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9">
                  {industry || "All Industries"}
                  <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0">
                <Command>
                  <CommandInput placeholder="Search industry..." />
                  <CommandList>
                    <CommandEmpty>No industry found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          const params = new URLSearchParams()
                          if (minScore) params.set("minScore", minScore.toString())
                          if (searchTerm) params.set("search", searchTerm)
                          window.location.href = `/prompts?${params.toString()}`
                        }}
                      >
                        All Industries
                      </CommandItem>
                      {[
                        "Marketing",
                        "Technology",
                        "Customer Service",
                        "Retail",
                        "Digital Marketing",
                        "Education",
                        "Healthcare",
                        "Finance",
                        "Legal",
                        "Real Estate",
                        "Human Resources",
                        "Sales",
                        "Content Creation",
                      ].map((ind) => (
                        <CommandItem
                          key={ind}
                          onSelect={() => {
                            const params = new URLSearchParams()
                            params.set("industry", ind)
                            if (minScore) params.set("minScore", minScore.toString())
                            if (searchTerm) params.set("search", searchTerm)
                            window.location.href = `/prompts?${params.toString()}`
                          }}
                        >
                          {ind}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Score Filter */}
            <div className="flex gap-2">
              {[70, 80, 90].map((score) => (
                <Button
                  key={score}
                  variant={minScore === score ? "default" : "outline"}
                  size="sm"
                  className={`h-9 ${minScore === score ? "bg-blue-600 text-white" : ""}`}
                  onClick={() => {
                    const params = new URLSearchParams()
                    if (industry) params.set("industry", industry)
                    if (searchTerm) params.set("search", searchTerm)
                    if (minScore !== score) params.set("minScore", score.toString())
                    window.location.href = `/prompts?${params.toString()}`
                  }}
                >
                  {score}+ Score
                </Button>
              ))}
            </div>

            {/* Clear Filters */}
            {(industry || minScore || searchTerm) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/prompts")}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          {isLoading ? (
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          ) : (
            <p className="text-muted-foreground">
              Showing <span className="font-medium">{prompts.length}</span> of{" "}
              <span className="font-medium">{pagination.total}</span> prompts
            </p>
          )}
          {searchTerm && !isLoading && (
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
              Search: {searchTerm}
              <Link href="/prompts" className="ml-2 hover:text-blue-900 dark:hover:text-blue-100">
                ×
              </Link>
            </Badge>
          )}
        </div>

        {/* Prompts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <PromptCardSkeleton key={i} />
            ))}
          </div>
        ) : prompts.length > 0 ? (
          <div className="space-y-8">
            {/* Grid of prompt cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-border">
                {page > 1 && (
                  <Link
                    href={`/prompts?page=${page - 1}${industry ? `&industry=${industry}` : ""}${minScore ? `&minScore=${minScore}` : ""}${searchTerm ? `&search=${searchTerm}` : ""}`}
                  >
                    <Button variant="outline">
                      Previous
                    </Button>
                  </Link>
                )}

                <span className="text-muted-foreground font-medium">
                  Page {page} of {pagination.totalPages}
                </span>

                {page < pagination.totalPages && (
                  <Link
                    href={`/prompts?page=${page + 1}${industry ? `&industry=${industry}` : ""}${minScore ? `&minScore=${minScore}` : ""}${searchTerm ? `&search=${searchTerm}` : ""}`}
                  >
                    <Button variant="outline">
                      Next
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms, or create a new prompt to get started.
              </p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Create Your First Prompt</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

async function getFilteredPrompts(
  page: number,
  pageSize: number,
  industry?: string,
  minScore?: number,
  searchTerm?: string,
) {
  try {
    const url = new URL("/api/prompts", window.location.origin)
    url.searchParams.append("page", page.toString())
    url.searchParams.append("pageSize", pageSize.toString())

    if (industry) url.searchParams.append("industry", industry)
    if (minScore) url.searchParams.append("minScore", minScore.toString())
    if (searchTerm) url.searchParams.append("searchTerm", searchTerm)

    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`)
      return { success: false, error: `HTTP error! status: ${response.status}` }
    }

    const result = await response.json()
    return result
  } catch (error: any) {
    console.error("Failed to fetch prompts:", error)
    return { success: false, error: error.message }
  }
} 