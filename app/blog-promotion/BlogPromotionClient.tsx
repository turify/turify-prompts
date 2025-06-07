"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Crown, 
  Zap, 
  CheckCircle, 
  Sparkles,
  Rocket,
  Timer
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  isPremium?: boolean
  premiumExpiresAt?: string
  premiumType?: string
}

interface BlogPromotionClientProps {
  user: User
}

export function BlogPromotionClient({ user }: BlogPromotionClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    blogUrl: "",
    articleUrl: "",
    title: "",
    description: ""
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/blog-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit blog post')
      }

      toast({
        title: "Blog submission received!",
        description: "We'll review your submission and activate your premium membership within 24-48 hours.",
      })

      // Reset form
      setFormData({
        blogUrl: "",
        articleUrl: "",
        title: "",
        description: ""
      })
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isPremiumActive = user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-400 via-purple-500 to-blue-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-400/20 via-purple-500/20 to-cyan-400/20" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-green-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Blog Partnership Program</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
              Share Your Story,
              <br />
              Get Premium Free
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed drop-shadow">
              Write about your Turify experience and receive 6 months of premium membership
            </p>

            {isPremiumActive && (
              <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-sm border border-green-300/30 px-6 py-3 rounded-xl mb-8">
                <Crown className="h-5 w-5 text-green-200" />
                <span className="text-green-100 font-medium">
                  You already have premium until {new Date(user.premiumExpiresAt!).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Quick benefits */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Zap className="h-4 w-4 text-yellow-300" />
                <span className="text-white text-sm font-medium">Priority Queue</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4 text-blue-300" />
                <span className="text-white text-sm font-medium">Advanced AI Models</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Crown className="h-4 w-4 text-purple-300" />
                <span className="text-white text-sm font-medium">Premium Status</span>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Submit Your Blog Post
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Fill out the form below and we'll review your submission
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 pt-0">


              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Blog URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://yourblog.com"
                    value={formData.blogUrl}
                    onChange={(e) => handleInputChange('blogUrl', e.target.value)}
                    required
                    className="h-12 text-base border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Article URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://yourblog.com/turify-review"
                    value={formData.articleUrl}
                    onChange={(e) => handleInputChange('articleUrl', e.target.value)}
                    required
                    className="h-12 text-base border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Article Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="My Experience with Turify: The Ultimate AI Prompt Tool"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    className="h-12 text-base border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-700">
                    Brief Description
                  </label>
                  <Textarea
                    placeholder="Tell us briefly about your blog post and what aspects of Turify you covered..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="text-base border-2 border-gray-200 focus:border-purple-500 rounded-xl resize-none"
                  />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Timer className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Review Process</h4>
                      <p className="text-sm text-blue-800">
                        Our team will review your submission within 24-48 hours. Once approved, 
                        your premium membership will be activated automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.blogUrl || !formData.articleUrl || !formData.title}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 mr-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Submitting Your Story...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5 mr-3" />
                      Submit for Premium Access
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Simple footer */}
          <div className="text-center mt-8">
            <p className="text-white/80 text-sm">
              Questions? Email us at{" "}
              <a href="mailto:support@turify.dev" className="text-white font-semibold hover:text-white/80 transition-colors">
                support@turify.dev
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 