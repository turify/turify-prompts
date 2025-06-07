import { Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PremiumBadgeProps {
  isPremium?: boolean
  premiumExpiresAt?: string
  size?: "sm" | "md" | "lg"
  showExpiry?: boolean
}

export function PremiumBadge({ 
  isPremium, 
  premiumExpiresAt, 
  size = "md", 
  showExpiry = false 
}: PremiumBadgeProps) {
  const isActive = isPremium && premiumExpiresAt && new Date(premiumExpiresAt) > new Date()
  
  if (!isActive) return null

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  return (
    <Badge 
      variant="outline" 
      className={`bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300 text-yellow-800 dark:from-yellow-950/20 dark:to-amber-950/20 dark:border-yellow-600 dark:text-yellow-200 ${sizeClasses[size]}`}
    >
      <Crown className={`${iconSizes[size]} mr-1`} />
      Premium
      {showExpiry && premiumExpiresAt && (
        <span className="ml-1 text-xs opacity-75">
          until {new Date(premiumExpiresAt).toLocaleDateString()}
        </span>
      )}
    </Badge>
  )
} 