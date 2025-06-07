"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield, AlertCircle, Key } from "lucide-react"

interface TwoFactorLoginProps {
  tempUserId: string
  onBack: () => void
}

export function TwoFactorLogin({ tempUserId, onBack }: TwoFactorLoginProps) {
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (verificationCode.length < 6) {
      toast({
        title: "Error",
        description: "Please enter a valid verification code",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          tempUserId, 
          token: verificationCode 
        }),
      })

      const result = await res.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Login successful!",
        })
        // Reload the page to refresh the auth state
        window.location.href = "/dashboard"
      } else {
        toast({
          title: "Error",
          description: result.message || "Verification failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the verification code from your authenticator app or use a backup code
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Verification Code
          </Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="Enter 6-digit code or backup code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\s/g, '').toUpperCase())}
            required
            disabled={isLoading}
            className="text-center text-lg font-mono tracking-widest"
            maxLength={8} // Allow for backup codes which can be longer
          />
          <p className="text-xs text-gray-500">
            Enter the 6-digit code from your authenticator app, or use one of your backup codes
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Can't access your authenticator app?</p>
              <p>Use one of your backup codes instead. Each backup code can only be used once.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading || verificationCode.length < 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Login"
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  )
} 