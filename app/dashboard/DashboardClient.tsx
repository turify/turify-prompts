"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Plus, 
  Globe, 
  Lock, 
  Star,
  Search,
  Filter,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { PreferencesDialog } from "@/components/preferences-dialog"
import { BlogPromotionBanner } from "@/components/blog-promotion-banner"
import { 
  getUserPrompts, 
  updateExistingPrompt, 
  deleteExistingPrompt,
  copyPrompt
} from "@/app/actions/prompt-actions"
import { INDUSTRIES } from "@/lib/constants"

interface DashboardClientProps {
  user: any
}

interface Prompt {
  id: string
  title: string
  description: string
  prompt_text: string
  industry: string
  score: number
  is_public: boolean
  created_at: string
  updated_at: string
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState<string>("all")
  const [privateFilter, setPrivateFilter] = useState<string>("all")
  
  // Edit dialog state
  const [editDialog, setEditDialog] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    industry: "",
    is_public: true
  })
  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deletingPrompt, setDeletingPrompt] = useState<Prompt | null>(null)
  
  // Preview dialog state
  const [previewDialog, setPreviewDialog] = useState(false)
  const [previewingPrompt, setPreviewingPrompt] = useState<Prompt | null>(null)
  
  // Preferences dialog state
  const [preferencesDialog, setPreferencesDialog] = useState(false)
  const [preferencesPrompt, setPreferencesPrompt] = useState<Prompt | null>(null)
  
  // Copy status
  const [copying, setCopying] = useState<string | null>(null)

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    try {
      setLoading(true)
      const result = await getUserPrompts(user.id, 1, 100) // Get first 100 prompts
      
      if (result.success) {
        setPrompts(result.prompts || [])
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load prompts",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching prompts:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter prompts based on search and filters
  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = searchTerm === "" || 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesIndustry = industryFilter === "all" || prompt.industry === industryFilter
    
    const matchesPrivacy = privateFilter === "all" ||
      (privateFilter === "public" && prompt.is_public) ||
      (privateFilter === "private" && !prompt.is_public)
    
    return matchesSearch && matchesIndustry && matchesPrivacy
  })

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setEditForm({
      title: prompt.title,
      description: prompt.description,
      industry: prompt.industry,
      is_public: prompt.is_public
    })
    setEditDialog(true)
  }

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return
    
    try {
      const formData = new FormData()
      formData.append("promptId", editingPrompt.id)
      formData.append("title", editForm.title)
      formData.append("promptText", editingPrompt.prompt_text) // Keep original prompt text
      formData.append("description", editForm.description)
      formData.append("industry", editForm.industry)
      formData.append("isPublic", editForm.is_public.toString())
      
      // Optimistic update - update local state immediately
      const updatedPrompt = {
        ...editingPrompt,
        title: editForm.title,
        description: editForm.description,
        industry: editForm.industry,
        is_public: editForm.is_public,
        updated_at: new Date().toISOString()
      }
      
      setPrompts(prevPrompts => 
        prevPrompts.map(prompt => 
          prompt.id === editingPrompt.id ? updatedPrompt : prompt
        )
      )
      
      // Close dialog immediately
      setEditDialog(false)
      setEditingPrompt(null)
      
      const result = await updateExistingPrompt(formData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Prompt updated successfully",
        })
      } else {
        // Revert optimistic update on failure
        setPrompts(prevPrompts => 
          prevPrompts.map(prompt => 
            prompt.id === editingPrompt.id ? editingPrompt : prompt
          )
        )
        toast({
          title: "Error",
          description: result.error || "Failed to update prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating prompt:", error)
      // Revert optimistic update on error
      if (editingPrompt) {
        setPrompts(prevPrompts => 
          prevPrompts.map(prompt => 
            prompt.id === editingPrompt.id ? editingPrompt : prompt
          )
        )
      }
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleDelete = (prompt: Prompt) => {
    setDeletingPrompt(prompt)
    setDeleteDialog(true)
  }

  const handleDeletePrompt = async () => {
    if (!deletingPrompt) return
    
    try {
      // Optimistic update - remove from local state immediately
      setPrompts(prevPrompts => 
        prevPrompts.filter(prompt => prompt.id !== deletingPrompt.id)
      )
      
      // Close dialog immediately
      setDeleteDialog(false)
      const promptToDelete = deletingPrompt
      setDeletingPrompt(null)
      
      const result = await deleteExistingPrompt(promptToDelete.id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Prompt deleted successfully",
        })
      } else {
        // Revert optimistic update on failure
        setPrompts(prevPrompts => [...prevPrompts, promptToDelete])
        toast({
          title: "Error",
          description: result.error || "Failed to delete prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting prompt:", error)
      // Revert optimistic update on error
      if (deletingPrompt) {
        setPrompts(prevPrompts => [...prevPrompts, deletingPrompt])
      }
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleCopy = async (prompt: Prompt) => {
    // Show preferences dialog for logged-in users
    setPreferencesPrompt(prompt)
    setPreferencesDialog(true)
  }

  const handleCopyWithPreferences = (processedText: string) => {
    navigator.clipboard.writeText(processedText)
    toast({
      title: "Copied to clipboard",
      description: "Text copied with your preferences applied",
    })
  }

  const handleCopyPrompt = async (prompt: Prompt) => {
    setCopying(prompt.id)
    
    try {
      // Create optimistic new prompt
      const newPrompt: Prompt = {
        ...prompt,
        id: `temp-${Date.now()}`, // Temporary ID
        title: prompt.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Optimistic update - add to local state immediately
      setPrompts(prevPrompts => [newPrompt, ...prevPrompts])
      
      const result = await copyPrompt(prompt.id, user.id)
      
      if (result.success) {
        // Replace temporary prompt with actual prompt ID from server
        if (result.promptId) {
          setPrompts(prevPrompts => 
            prevPrompts.map(p => 
              p.id === newPrompt.id ? { ...newPrompt, id: result.promptId } : p
            )
          )
        }
        toast({
          title: "Success",
          description: result.message || "Prompt duplicated successfully",
        })
      } else {
        // Remove optimistic prompt on failure
        setPrompts(prevPrompts => 
          prevPrompts.filter(p => p.id !== newPrompt.id)
        )
        toast({
          title: "Error",
          description: result.error || "Failed to duplicate prompt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error duplicating prompt:", error)
      // Remove optimistic prompt on error
      const tempId = `temp-${Date.now()}`
      setPrompts(prevPrompts => 
        prevPrompts.filter(p => !p.id.startsWith('temp-'))
      )
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setCopying(null)
    }
  }

  const handleView = (prompt: Prompt) => {
    router.push(`/prompt/${prompt.id}`)
  }

  const handlePreview = (prompt: Prompt) => {
    setPreviewingPrompt(prompt)
    setPreviewDialog(true)
  }

  const handleCardClick = (prompt: Prompt, event: React.MouseEvent) => {
    // Don't open preview if clicking on dropdown menu or its trigger
    const target = event.target as HTMLElement
    if (target.closest('[data-radix-dropdown-menu-trigger]') || target.closest('[data-radix-dropdown-menu-content]')) {
      return
    }
    handlePreview(prompt)
  }

  const getIndustryColor = (industry: string) => {
    switch (industry) {
      case "Marketing": return "bg-brand-purple/10 text-brand-purple border-brand-purple/20"
      case "Technology": return "bg-brand-blue/10 text-brand-blue border-brand-blue/20"
      case "Digital Marketing": return "bg-brand-teal/10 text-brand-teal border-brand-teal/20"
      case "Customer Service": return "bg-brand-pink/10 text-brand-pink border-brand-pink/20"
      case "Retail": return "bg-brand-amber/10 text-brand-amber border-brand-amber/20"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
            <span className="text-muted-foreground font-medium">Loading your prompts...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your prompts and track your activity.
          </p>
        </div>
        <Button
          onClick={() => router.push("/")}
          className="gap-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Create New Prompt
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-purple/10 rounded-lg">
                <Star className="h-4 w-4 text-brand-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Prompts</p>
                <p className="text-2xl font-bold">{prompts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-teal/10 rounded-lg">
                <Globe className="h-4 w-4 text-brand-teal" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Public</p>
                <p className="text-2xl font-bold">{prompts.filter(p => p.is_public).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-amber/10 rounded-lg">
                <Lock className="h-4 w-4 text-brand-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Private</p>
                <p className="text-2xl font-bold">{prompts.filter(p => !p.is_public).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-blue/10 rounded-lg">
                <Star className="h-4 w-4 text-brand-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">
                  {prompts.length > 0 
                    ? Math.round(prompts.reduce((acc, p) => acc + (p.score || 0), 0) / prompts.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blog Promotion Banner */}
      <BlogPromotionBanner user={user} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Prompts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {INDUSTRIES.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={privateFilter} onValueChange={setPrivateFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Prompts Grid */}
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-4">
                {prompts.length === 0 
                  ? "Get started by creating your first prompt!" 
                  : "Try adjusting your search or filters."
                }
              </p>
              {prompts.length === 0 && (
                <Button
                  onClick={() => router.push("/")}
                  className="gap-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Prompt
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPrompts.map((prompt) => (
                <Card 
                  key={prompt.id} 
                  className="group hover:shadow-md transition-shadow cursor-pointer"
                  onClick={(e) => handleCardClick(prompt, e)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-2 mb-1">
                          {prompt.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {prompt.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleView(prompt)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(prompt)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(prompt)
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            {copying === prompt.id ? "Using..." : "Use Prompt"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            handleCopyPrompt(prompt)
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            {copying === prompt.id ? "Duplicating..." : "Duplicate Prompt"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(prompt)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getIndustryColor(prompt.industry)}>
                          {prompt.industry}
                        </Badge>
                        {prompt.is_public ? (
                          <Badge variant="outline" className="bg-brand-teal/10 text-brand-teal border-brand-teal/20">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/20">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-brand-amber text-brand-amber" />
                        <span className="font-medium">{prompt.score || 0}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-muted-foreground">
                      Created {new Date(prompt.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Prompt Details</DialogTitle>
            <DialogDescription>
              Update the metadata for your prompt. The prompt content itself cannot be changed here.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Enter prompt title"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter prompt description"
                className="min-h-[80px]"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-industry">Industry</Label>
              <Select value={editForm.industry} onValueChange={(value) => setEditForm({ ...editForm, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-public"
                checked={editForm.is_public}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_public: checked })}
              />
              <Label htmlFor="edit-public">Make this prompt public</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrompt}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingPrompt?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePrompt}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {previewingPrompt?.title}
            </DialogTitle>
            <DialogDescription>
              {previewingPrompt?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 space-y-4">
            {/* Metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={previewingPrompt ? getIndustryColor(previewingPrompt.industry) : ""}>
                {previewingPrompt?.industry}
              </Badge>
              {previewingPrompt?.is_public ? (
                <Badge variant="outline" className="bg-brand-teal/10 text-brand-teal border-brand-teal/20">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/20">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <Star className="h-3 w-3 fill-brand-amber text-brand-amber" />
                <span className="text-sm font-medium">{previewingPrompt?.score || 0}</span>
              </div>
            </div>
            
            {/* Prompt Text */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Prompt Text</Label>
              <div className="relative">
                <Textarea
                  value={previewingPrompt?.prompt_text || ""}
                  readOnly
                  className="min-h-[200px] resize-none bg-muted/30 font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                if (previewingPrompt) {
                  handleCopy(previewingPrompt)
                }
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Use Prompt
            </Button>
            <Button 
              onClick={() => {
                if (previewingPrompt) {
                  setPreviewDialog(false)
                  handleView(previewingPrompt)
                }
              }}
              className="bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Full Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preferences Dialog */}
      <PreferencesDialog
        open={preferencesDialog}
        onOpenChange={setPreferencesDialog}
        promptText={preferencesPrompt?.prompt_text || ""}
        currentUser={user}
        onCopyWithPreferences={handleCopyWithPreferences}
      />
    </div>
  )
} 