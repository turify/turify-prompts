"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Eye, EyeOff, User, Mail, Lock, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Password validation
  const passwordValidation = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!isPasswordValid) {
      toast({
        title: "Invalid password",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await signup(name, email, password)

      if (result.success) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Signup failed",
          description: result.message || "Failed to create account.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Signup failed",
        description: "An error occurred during signup.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <User className="h-4 w-4" />
            Full name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            className="h-12 border-gray-200 focus:border-brand-purple focus:ring-brand-purple"
            placeholder="Enter your full name"
          />
        </div>

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
              placeholder="Create a strong password"
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
          
          {/* Password requirements */}
          {password && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${passwordValidation.length ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.length ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  8+ characters
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.uppercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Uppercase letter
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.lowercase ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Lowercase letter
                </div>
                <div className={`flex items-center gap-1 ${passwordValidation.number ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordValidation.number ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Number
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-purple hover:text-brand-blue transition-colors">
          Sign in
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !isPasswordValid}
        className="w-full h-12 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity text-white font-medium text-base disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  )
}
