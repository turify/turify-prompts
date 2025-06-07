"use client"

import { GitBranch, Clock, TrendingUp, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Version {
  id: string
  version_number: number
  prompt_text: string
  score: number
  created_at: string
}

interface VersionHistoryProps {
  versions: Version[]
  currentUser?: any
  promptOwner?: string
  onVersionSelect?: (version: Version) => void
  viewedVersion?: Version | null
}

export function VersionHistory({ versions, currentUser, promptOwner, onVersionSelect, viewedVersion }: VersionHistoryProps) {
  // Only show version history if there are multiple versions
  if (!versions || versions.length <= 1) {
    return null
  }

  // Only show to the owner or if no owner (public prompts)
  const canViewHistory = !promptOwner || currentUser?.id === promptOwner

  if (!canViewHistory) {
    return null
  }

  // Sort versions by version number (latest first)
  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number)

  return (
    <Card className="border-2 border-brand-teal/20 shadow-md">
      <CardHeader className="bg-gradient-to-r from-brand-teal/10 to-brand-purple/10">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-brand-teal" />
          <CardTitle>Version History</CardTitle>
          <Badge variant="outline" className="ml-auto">
            {versions.length} version{versions.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {sortedVersions.map((version, index) => {
            const isLatest = index === 0
            const isViewed = viewedVersion?.id === version.id || (!viewedVersion && isLatest)
            const scoreChange = index < sortedVersions.length - 1 
              ? version.score - sortedVersions[index + 1].score 
              : 0

            return (
              <div key={version.id} className="relative">
                <div 
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isViewed
                      ? 'bg-brand-purple/10 border-brand-purple/30 ring-2 ring-brand-purple/20' 
                      : isLatest 
                        ? 'bg-brand-teal/5 border-brand-teal/30 ring-1 ring-brand-teal/20 hover:bg-brand-teal/10' 
                        : 'bg-muted/30 border-muted hover:bg-muted/50'
                  }`}
                  onClick={() => onVersionSelect?.(version)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${
                          isViewed
                            ? 'bg-brand-purple text-white' 
                          : isLatest 
                            ? 'bg-brand-teal text-white' 
                            : 'bg-muted-foreground/20 text-muted-foreground'
                        }`}
                      >
                        v{version.version_number}
                      </Badge>
                      {isLatest && !viewedVersion && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {isViewed && viewedVersion && (
                        <Badge variant="outline" className="text-xs border-brand-purple text-brand-purple">
                          Viewing
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className="font-medium">{version.score}/100</span>
                        {scoreChange !== 0 && (
                          <span className={`text-xs ${
                            scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ({scoreChange > 0 ? '+' : ''}{scoreChange})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(version.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-3">
                      {version.prompt_text.length > 150 
                        ? `${version.prompt_text.substring(0, 150)}...` 
                        : version.prompt_text
                      }
                    </p>
                  </div>
                </div>
                
                {index < sortedVersions.length - 1 && (
                  <div className="flex justify-center my-2">
                    <Separator className="w-8" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {currentUser?.id === promptOwner && (
          <div className="mt-4 pt-4 border-t border-muted">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>You can create new versions using "Improve This Prompt"</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 