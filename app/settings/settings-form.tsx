"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { updateUserPreferences, type User } from "@/app/actions/auth-actions"
import { 
  User as UserIcon, 
  Mail, 
  Bell, 
  Palette, 
  Globe, 
  Shield, 
  Lock,
  UserCircle,
  Settings as SettingsIcon
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { TwoFactorDialog } from "@/components/two-factor-dialog"

interface SettingsFormProps {
  user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
  const { theme: currentTheme, setTheme: setNextTheme } = useTheme()
  const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications ?? true)
  const [pushNotifications, setPushNotifications] = useState(user.pushNotifications ?? true)
  const [language, setLanguage] = useState(user.language ?? "English")
  const [country, setCountry] = useState(user.country ?? "United States")
  const [theme, setTheme] = useState(user.theme ?? currentTheme ?? "system")
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled ?? false)
  const { toast } = useToast()

  // Get user initials for fallback avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Custom theme handler that updates both states
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    setNextTheme(newTheme)
  }

  const handle2FAToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const result = await updateUserPreferences(user.id, {
        emailNotifications,
        pushNotifications,
        theme,
        language,
        country,
      })

      if (result.success) {
        toast({
          title: "Settings saved",
          description: "Your preferences have been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save settings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-brand-purple to-brand-blue rounded-lg">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-lg text-gray-600">Manage your account preferences and settings</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Section */}
          <Card className="border-2 border-brand-purple/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10">
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-brand-purple" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and basic information</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-20 w-20 border-2 border-brand-purple/20">
                    <AvatarImage 
                      src={user.image} 
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-brand-purple to-brand-blue text-white text-lg font-bold">
                      {getUserInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="h-4 w-4" />
                      Display Name
                    </label>
                    <input 
                      type="text" 
                      value={user.name}
                      className="w-full max-w-lg rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent transition-colors"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Contact support to change your display name</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Cannot be changed
                      </Badge>
                    </label>
                    <input 
                      type="email" 
                      value={user.email}
                      className="w-full max-w-lg rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 cursor-not-allowed"
                      readOnly
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Your email address is used for login and cannot be modified</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="border-2 border-brand-blue/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-brand-blue/10 to-brand-teal/10">
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-brand-blue" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your experience and appearance</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Theme Setting */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-blue/10 rounded-lg">
                    <Palette className="h-4 w-4 text-brand-blue" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Theme</h3>
                    <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
                  </div>
                </div>
                <div className="min-w-[150px]">
                  <select 
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>

              {/* Language Setting */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-teal/10 rounded-lg">
                    <Globe className="h-4 w-4 text-brand-teal" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Language</h3>
                    <p className="text-sm text-gray-600">Select your preferred language</p>
                  </div>
                </div>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="min-w-[150px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              {/* Country Setting */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-teal/10 rounded-lg">
                    <Globe className="h-4 w-4 text-brand-teal" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Country</h3>
                    <p className="text-sm text-gray-600">Your locale will be used in system prompts to enhance prompt creation</p>
                  </div>
                </div>
                <select 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="min-w-[150px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Spain">Spain</option>
                  <option value="Italy">Italy</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Japan">Japan</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Singapore">Singapore</option>
                  <option value="India">India</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="border-2 border-brand-amber/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-brand-amber/10 to-brand-pink/10">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand-amber" />
                Notifications
              </CardTitle>
              <CardDescription>Control how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-amber/10 rounded-lg">
                    <Mail className="h-4 w-4 text-brand-amber" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about your prompts and account</p>
                  </div>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-pink/10 rounded-lg">
                    <Bell className="h-4 w-4 text-brand-pink" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Get notified when someone interacts with your prompts</p>
                  </div>
                </div>
                <Switch 
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="border-2 border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Security & Privacy
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Lock className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                </div>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setShowPasswordDialog(true)}>
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setShow2FADialog(true)}>
                  {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity px-8 py-3 text-white font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save All Changes"
              )}
            </Button>
          </div>
        </div>
      </div>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        userId={user.id}
      />

      <TwoFactorDialog
        open={show2FADialog}
        onOpenChange={setShow2FADialog}
        userId={user.id}
        isEnabled={twoFactorEnabled}
        onToggle={handle2FAToggle}
      />
    </div>
  )
} 