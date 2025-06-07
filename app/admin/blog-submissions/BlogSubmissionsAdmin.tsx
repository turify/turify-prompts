"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Clock, 
  User,
  Calendar,
  MessageSquare,
  Crown
} from "lucide-react"

interface BlogSubmission {
  id: string
  userId: string
  blogUrl: string
  articleUrl: string
  title: string
  description: string | null
  status: string
  reviewNotes: string | null
  submittedAt: string
  reviewedAt: string | null
  reviewedBy: string | null
  user: {
    name: string
    email: string
  }
}

export function BlogSubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<BlogSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({})
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/blog-submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch blog submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (submissionId: string, action: 'approve' | 'reject') => {
    setProcessingIds(prev => new Set(prev).add(submissionId))
    
    try {
      const response = await fetch('/api/admin/blog-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          action,
          reviewNotes: reviewNotes[submissionId] || null
        }),
      })

      if (response.ok) {
        toast({
          title: action === 'approve' ? "Submission Approved" : "Submission Rejected",
          description: action === 'approve' 
            ? "Premium membership has been activated for the user" 
            : "The submission has been rejected",
        })
        fetchSubmissions() // Refresh the list
        setReviewNotes(prev => ({ ...prev, [submissionId]: '' }))
      } else {
        throw new Error('Failed to process submission')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process submission",
        variant: "destructive",
      })
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(submissionId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading blog submissions...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog Submissions</h1>
        <p className="text-muted-foreground">Review and manage blog submissions for premium membership program</p>
      </div>

      <div className="grid gap-6">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No blog submissions found</p>
            </CardContent>
          </Card>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{submission.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {submission.user.name} ({submission.user.email})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Blog URL</h4>
                    <a 
                      href={submission.blogUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {submission.blogUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Article URL</h4>
                    <a 
                      href={submission.articleUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {submission.articleUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {submission.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{submission.description}</p>
                  </div>
                )}

                {submission.reviewNotes && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Review Notes
                    </h4>
                    <p className="text-muted-foreground bg-muted p-3 rounded-md">{submission.reviewNotes}</p>
                    {submission.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reviewed on {new Date(submission.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {submission.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium mb-2">Review Notes (Optional)</label>
                      <Textarea
                        placeholder="Add notes about your review decision..."
                        value={reviewNotes[submission.id] || ''}
                        onChange={(e) => setReviewNotes(prev => ({ 
                          ...prev, 
                          [submission.id]: e.target.value 
                        }))}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleReview(submission.id, 'approve')}
                        disabled={processingIds.has(submission.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingIds.has(submission.id) ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Crown className="h-4 w-4 mr-2" />
                            Approve & Grant Premium
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handleReview(submission.id, 'reject')}
                        disabled={processingIds.has(submission.id)}
                        variant="destructive"
                      >
                        {processingIds.has(submission.id) ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 