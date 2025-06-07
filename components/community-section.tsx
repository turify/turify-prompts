"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PromptCard } from "@/components/prompt-card"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

interface CommunityPrompt {
  id: string
  title: string
  prompt_text: string
  description?: string
  industry?: string
  score?: number
  impressions?: number
  created_at: string
  current_version?: number
  latest_version_number?: number
}

export function CommunitySection() {
  const [prompts, setPrompts] = useState<CommunityPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [showingMore, setShowingMore] = useState(false)
  const [visibleCount, setVisibleCount] = useState(8)
  
  const fetchLatestPrompts = async () => {
    try {
      setLoading(true)
      // Fetch the latest 16 prompts (8 initially shown, 8 for "show more")
      const response = await fetch(`/api/prompts?page=1&pageSize=16`)
      const result = await response.json()
      
      if (result.success) {
        setPrompts(result.prompts || [])
      } else {
        console.error("Failed to fetch prompts:", result.error)
      }
    } catch (error) {
      console.error("Error fetching prompts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestPrompts()
  }, [])

  const handleShowMore = () => {
    setVisibleCount(16)
    setShowingMore(true)
  }

  const visiblePrompts = prompts.slice(0, visibleCount)

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-brand-purple" />
              From the Community
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing prompts created and shared by our community
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-brand-purple" />
            From the Community
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing prompts created and shared by our community
          </p>
        </div>

        {prompts.length > 0 ? (
          <div className="space-y-8">
            {/* Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visiblePrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>

            {/* Show More / View All Section */}
            <div className="text-center">
              {!showingMore && prompts.length > 8 ? (
                <Button
                  onClick={handleShowMore}
                  variant="outline"
                  size="lg"
                  className="border-2 border-brand-purple/50 dark:border-brand-purple/70 text-brand-purple dark:text-brand-purple bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-brand-purple hover:text-white dark:hover:bg-brand-purple dark:hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-purple/25 dark:hover:shadow-brand-purple/30 px-8 py-3"
                >
                  Show More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                prompts.length > visibleCount && (
                  <Link href="/prompts">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 px-8 py-3"
                    >
                      View All Prompts
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No prompts yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to create and share a prompt with the community!
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                  Create Your First Prompt
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
} 