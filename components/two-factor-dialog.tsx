"use client"

import { useState, useEffect } from "react"
import { generate2FASetup, enable2FA, disable2FA } from "@/app/actions/auth-actions"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Shield, ShieldCheck, Copy, Eye, EyeOff, Download } from "lucide-react"
import Image from "next/image"

interface TwoFactorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  isEnabled: boolean
  onToggle: () => void
}

export function TwoFactorDialog({ open, onOpenChange, userId, isEnabled, onToggle }: TwoFactorDialogProps) {
  const [step, setStep] = useState<"setup" | "verify" | "disable">("setup")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && !isEnabled) {
      generateSetup()
    } else if (open && isEnabled) {
      setStep("disable")
    }
  }, [open, isEnabled])

  const generateSetup = async () => {
    setIsLoading(true)
    try {
      const result = await generate2FASetup(userId)
      if (result.success) {
        setQrCode(result.qrCode!)
        setSecret(result.secret!)
        setBackupCodes(result.backupCodes!)
        setStep("setup")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate 2FA setup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await enable2FA(userId, secret, verificationCode, backupCodes)
      if (result.success) {
        toast({
          title: "Success",
          description: "Two-factor authentication enabled successfully",
        })
        onToggle()
        onOpenChange(false)
        setStep("setup")
        setVerificationCode("")
      } else {
        toast({
          title: "Error",
          description: result.message,
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

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await disable2FA(userId, password)
      if (result.success) {
        toast({
          title: "Success",
          description: "Two-factor authentication disabled successfully",
        })
        onToggle()
        onOpenChange(false)
        setPassword("")
      } else {
        toast({
          title: "Error",
          description: result.message,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  const downloadBackupCodes = () => {
    const content = `Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleDateString()}

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Important:
- Keep these codes in a safe place
- Each code can only be used once
- Use these codes if you lose access to your authenticator app`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'turify-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading && !qrCode) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Setting up Two-Factor Authentication
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEnabled ? (
              <>
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Disable Two-Factor Authentication
              </>
            ) : step === "setup" ? (
              <>
                <Shield className="h-5 w-5 text-blue-600" />
                Enable Two-Factor Authentication
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-blue-600" />
                Verify Two-Factor Authentication
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEnabled 
              ? "Enter your password to disable two-factor authentication."
              : step === "setup" 
                ? "Scan the QR code with your authenticator app and save your backup codes."
                : "Enter the verification code from your authenticator app."
            }
          </DialogDescription>
        </DialogHeader>

        {step === "setup" && !isEnabled && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block border">
                <Image 
                  src={qrCode} 
                  alt="2FA QR Code" 
                  width={200} 
                  height={200}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Scan this QR code with Google Authenticator, Authy, or another TOTP app
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Backup Codes</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showBackupCodes ? "Hide" : "Show"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadBackupCodes}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              {showBackupCodes && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-2 rounded">
                        <span>{code}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Save these codes in a safe place. Each can only be used once.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setStep("verify")}>
                Next: Verify Setup
              </Button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={isLoading}
                className="text-center text-lg font-mono tracking-widest"
              />
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("setup")}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Enable 2FA"
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "disable" && isEnabled && (
          <form onSubmit={handleDisable} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Disabling two-factor authentication will make your account less secure.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                variant="destructive"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 