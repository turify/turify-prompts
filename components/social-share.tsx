"use client"

import { useState } from "react"
import { Twitter, Facebook, Linkedin, Mail, LinkIcon, Check, Share2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface SocialShareProps {
  url: string
  title: string
  description?: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function SocialShare({
  url,
  title,
  description = "",
  className,
  variant = "outline",
  size = "default",
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Ensure we have the full URL
  const fullUrl = url.startsWith("http") ? url : `${typeof window !== "undefined" ? window.location.origin : ""}${url}`

  // Encoded values for sharing
  const encodedUrl = encodeURIComponent(fullUrl)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || "")

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-[#4267B2]/10 hover:text-[#4267B2]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      color: "hover:bg-[#0077B5]/10 hover:text-[#0077B5]",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: "hover:bg-gray-100 hover:text-gray-900",
    },
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)

      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
      toast({
        title: "Copy failed",
        description: "Failed to copy the link to clipboard",
        variant: "destructive",
      })
    }
  }

  // Track share event
  const trackShare = async (platform: string) => {
    try {
      await fetch("/api/analytics/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fullUrl,
          platform,
          title,
        }),
      })
    } catch (error) {
      console.error("Error tracking share:", error)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="grid gap-1">
          {shareLinks.map((link) => (
            <Button
              key={link.name}
              variant="ghost"
              size="sm"
              className={`justify-start ${link.color}`}
              onClick={() => {
                window.open(link.url, "_blank")
                trackShare(link.name.toLowerCase())
              }}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.name}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="justify-start hover:bg-gray-100 hover:text-gray-900"
            onClick={() => {
              copyToClipboard()
              trackShare("copy")
            }}
          >
            {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <LinkIcon className="mr-2 h-4 w-4" />}
            Copy link
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
