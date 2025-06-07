"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { TwoFactorLogin } from "@/components/two-factor-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [tempUserId, setTempUserId] = useState("")
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        // Check if 2FA verification is required
        if ((result as any).requiresTwoFactor) {
          setTempUserId((result as any).tempUserId)
          setShowTwoFactor(true)
          toast({
            title: "2FA Required",
            description: (result as any).message || "Please enter your two-factor authentication code.",
          })
        } else {
          toast({
            title: "Login successful",
            description: "You have been logged in successfully.",
          })
          router.push(callbackUrl)
        }
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Invalid email or password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An error occurred during login.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowTwoFactor(false)
    setTempUserId("")
    setPassword("") // Clear password for security
  }

  // Show 2FA verification screen
  if (showTwoFactor) {
    return <TwoFactorLogin tempUserId={tempUserId} onBack={handleBackToLogin} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Mail className="h-4 w-4" />
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 border-gray-200 focus:border-brand-purple focus:ring-brand-purple"
            placeholder="Enter your email"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock className="h-4 w-4" />
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-12 pr-12 border-gray-200 focus:border-brand-purple focus:ring-brand-purple"
              placeholder="Enter your password"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-brand-purple hover:text-brand-blue transition-colors">
            Sign up
          </Link>
        </div>
        <Link href="/forgot-password" className="font-medium text-brand-purple hover:text-brand-blue transition-colors">
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity text-white font-medium text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  )
}
