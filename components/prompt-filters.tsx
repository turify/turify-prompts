"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { INDUSTRIES } from "@/lib/constants"

interface PromptFiltersProps {
  selectedIndustry?: string
  selectedMinScore?: number
  searchTerm?: string
}

export function PromptFilters({ selectedIndustry, selectedMinScore, searchTerm }: PromptFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [industry, setIndustry] = useState(selectedIndustry || "")
  const [minScore, setMinScore] = useState<number | undefined>(selectedMinScore)
  const [scoreOrder, setScoreOrder] = useState<"highest" | "lowest" | null>(null)

  useEffect(() => {
    setIndustry(selectedIndustry || "")
    setMinScore(selectedMinScore)
  }, [selectedIndustry, selectedMinScore])

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (industry) {
      params.set("industry", industry)
    }

    if (minScore !== undefined) {
      params.set("minScore", minScore.toString())
    }

    if (searchTerm) {
      params.set("search", searchTerm)
    }

    // Reset to page 1 when filters change
    params.set("page", "1")

    router.push(`/prompts?${params.toString()}`)
  }

  const clearFilters = () => {
    setIndustry("")
    setMinScore(undefined)
    setScoreOrder(null)

    const params = new URLSearchParams()
    if (searchTerm) {
      params.set("search", searchTerm)
    }

    router.push(`/prompts?${params.toString()}`)
  }

  return (
    <Card className="border-2 border-brand-blue/20 shadow-md">
      <CardHeader className="bg-gradient-to-r from-brand-blue/10 to-transparent">
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Industry</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between mt-1.5 bg-white border-muted"
                >
                  {industry ? INDUSTRIES.find((i) => i.value === industry)?.label : "Select industry..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search industry..." />
                  <CommandList>
                    <CommandEmpty>No industry found.</CommandEmpty>
                    <CommandGroup>
                      {INDUSTRIES.map((i) => (
                        <CommandItem
                          key={i.value}
                          value={i.value}
                          onSelect={(value) => {
                            setIndustry(value === industry ? "" : value)
                            setOpen(false)
                          }}
                        >
                          <span
                            className={cn(
                              "mr-2 h-2 w-2 rounded-full",
                              i.value === "Marketing"
                                ? "bg-brand-purple"
                                : i.value === "Technology"
                                  ? "bg-brand-blue"
                                  : i.value === "Customer Service"
                                    ? "bg-brand-teal"
                                    : i.value === "Retail"
                                      ? "bg-brand-pink"
                                      : "bg-brand-amber",
                            )}
                          />
                          {i.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium">Minimum Score</label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {[70, 80, 90].map((score) => (
                <Button
                  key={score}
                  variant="outline"
                  className={cn(
                    "justify-center bg-white border-muted",
                    minScore === score && "bg-brand-blue/10 border-brand-blue/20 text-brand-blue",
                  )}
                  onClick={() => setMinScore(minScore === score ? undefined : score)}
                >
                  {score}+
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button
            className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:opacity-90 transition-opacity"
            onClick={applyFilters}
          >
            Apply Filters
          </Button>

          <Button
            className="w-full bg-white text-foreground hover:bg-muted/80 border border-border"
            variant="outline"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
