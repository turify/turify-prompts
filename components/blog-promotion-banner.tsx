import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Gift, Crown, Sparkles, ArrowRight } from "lucide-react"

interface BlogPromotionBannerProps {
  user?: {
    isPremium?: boolean
    premiumExpiresAt?: string
  }
}

export function BlogPromotionBanner({ user }: BlogPromotionBannerProps) {
  // Don't show banner if user already has active premium
  const isPremiumActive = user?.isPremium && user?.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()
  
  if (isPremiumActive) return null

  return (
    <Card className="border-2 border-brand-purple/20 bg-gradient-to-r from-brand-purple/5 to-brand-blue/5 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-brand-purple to-brand-blue rounded-full">
              <Gift className="h-6 w-6 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                Get 6 Months Premium Free!
              </h3>
              <p className="text-muted-foreground text-sm">
                Write about Turify on your blog and unlock premium features including priority queue and advanced AI models.
              </p>
              
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs text-brand-purple">
                  <Crown className="h-3 w-3" />
                  <span>Priority Access</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-brand-blue">
                  <Sparkles className="h-3 w-3" />
                  <span>Advanced Models</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Worth $89
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Link href="/blog-promotion">
              <Button className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 text-white">
                Learn More
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 