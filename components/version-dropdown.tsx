"use client"

import { useState } from "react"
import { GitBranch, ChevronDown, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface Version {
  id: string
  version_number: number
  prompt_text: string
  score: number
  created_at: string
}

interface VersionDropdownProps {
  versions: Version[]
  currentVersion: number
  viewedVersion?: Version | null
  onVersionSelect: (version: Version | null) => void
}

export function VersionDropdown({ 
  versions, 
  currentVersion, 
  viewedVersion, 
  onVersionSelect 
}: VersionDropdownProps) {
  // Don't show if there's only one version
  if (!versions || versions.length <= 1) {
    return null
  }

  // Sort versions by version number (latest first)
  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number)
  
  const displayedVersionNumber = viewedVersion?.version_number || currentVersion

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 bg-brand-teal/10 text-brand-teal px-2 py-1 rounded-full text-xs font-medium border-brand-teal/20 hover:bg-brand-teal/20"
        >
          <GitBranch className="h-3 w-3" />
          v{displayedVersionNumber}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Version History ({versions.length} versions)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Current/Latest version option */}
        <DropdownMenuItem
          onClick={() => onVersionSelect(null)}
          className={`flex items-center justify-between p-3 ${
            !viewedVersion ? 'bg-brand-purple/10' : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-teal text-white">
              v{currentVersion}
            </Badge>
            <span className="text-sm font-medium">Current Version</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{sortedVersions[0]?.score}/100</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Older versions */}
        {sortedVersions.slice(1).map((version, index) => {
          const isSelected = viewedVersion?.id === version.id
          // Compare with the next version (index + 2 because we sliced the array)
          const nextVersion = sortedVersions[index + 2]
          const scoreChange = nextVersion ? version.score - nextVersion.score : 0
          
          return (
            <DropdownMenuItem
              key={version.id}
              onClick={() => onVersionSelect(version)}
              className={`flex items-center justify-between p-3 ${
                isSelected ? 'bg-brand-purple/10' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge className="bg-muted-foreground/20 text-muted-foreground">
                  v{version.version_number}
                </Badge>
                <div className="flex flex-col">
                  <span className="text-sm">
                    {new Date(version.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{version.score}/100</span>
                {scoreChange !== 0 && (
                  <span className={`${
                    scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ({scoreChange > 0 ? '+' : ''}{scoreChange})
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 