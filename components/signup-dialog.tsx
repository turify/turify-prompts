"use client"

import { Sparkles, GitBranch, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface SignupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promptTitle?: string
}

export function SignupDialog({ open, onOpenChange, promptTitle }: SignupDialogProps) {
  const router = useRouter()

  const handleSignUp = () => {
    onOpenChange(false)
    router.push('/signup')
  }

  const handleSignIn = () => {
    onOpenChange(false)
    router.push('/login')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-brand-amber" />
            <DialogTitle>Sign Up to Improve Prompts</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            Create an account to improve and save prompts. You'll get:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                <GitBranch className="h-4 w-4 text-brand-purple" />
              </div>
              <div>
                <p className="font-medium text-sm">Create Versions & Forks</p>
                <p className="text-xs text-muted-foreground">
                  Improve existing prompts and track version history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <Star className="h-4 w-4 text-brand-blue" />
              </div>
              <div>
                <p className="font-medium text-sm">Save & Share</p>
                <p className="text-xs text-muted-foreground">
                  Build your prompt library and share with others
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-teal/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-brand-teal" />
              </div>
              <div>
                <p className="font-medium text-sm">AI-Powered Improvements</p>
                <p className="text-xs text-muted-foreground">
                  Get smart suggestions and auto-save evaluations
                </p>
              </div>
            </div>
          </div>

          {promptTitle && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                You're about to improve: <span className="font-medium text-foreground">"{promptTitle}"</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="border-brand-purple text-brand-purple hover:bg-brand-purple/10"
            >
              Sign In
            </Button>
            <Button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Sign Up Free
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 