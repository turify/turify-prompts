"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AdminPromptsList() {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPrompts() {
      try {
        setLoading(true)
        // Simulate fetching prompts
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setPrompts([
          {
            id: "1",
            title: "Marketing Email Generator",
            description: "Creates compelling marketing emails for product launches",
            industry: "Marketing",
            score: 85,
            isPublic: true,
            createdAt: "2023-05-01T12:00:00Z",
            user: { name: "John Doe", email: "john@example.com" },
          },
          {
            id: "2",
            title: "Product Description Writer",
            description: "Generates detailed product descriptions for e-commerce",
            industry: "Retail",
            score: 92,
            isPublic: true,
            createdAt: "2023-05-02T14:30:00Z",
            user: { name: "Jane Smith", email: "jane@example.com" },
          },
          {
            id: "3",
            title: "Blog Post Outline Creator",
            description: "Creates structured outlines for blog posts on any topic",
            industry: "Content",
            score: 78,
            isPublic: false,
            createdAt: "2023-05-03T09:15:00Z",
            user: { name: "Alex Johnson", email: "alex@example.com" },
          },
          {
            id: "4",
            title: "Technical Documentation Helper",
            description: "Assists in creating clear technical documentation",
            industry: "Technology",
            score: 88,
            isPublic: true,
            createdAt: "2023-05-04T16:45:00Z",
            user: { name: "Sam Wilson", email: "sam@example.com" },
          },
          {
            id: "5",
            title: "Social Media Post Generator",
            description: "Creates engaging social media posts for various platforms",
            industry: "Social Media",
            score: 90,
            isPublic: true,
            createdAt: "2023-05-05T11:20:00Z",
            user: { name: "Taylor Brown", email: "taylor@example.com" },
          },
        ])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching prompts:", err)
        setError("Failed to load prompts")
        setLoading(false)
      }
    }

    fetchPrompts()
  }, [])

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      setPrompts(prompts.filter((prompt) => prompt.id !== id))
    }
  }

  const handleTogglePublic = (id) => {
    setPrompts(prompts.map((prompt) => (prompt.id === id ? { ...prompt, isPublic: !prompt.isPublic } : prompt)))
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold">All Prompts</h2>
          <p className="text-sm text-muted-foreground">Manage all prompts in the system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button>Add New</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Title</th>
                  <th className="px-4 py-3 text-left font-medium">Industry</th>
                  <th className="px-4 py-3 text-left font-medium">Score</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Created By</th>
                  <th className="px-4 py-3 text-left font-medium">Created At</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((prompt) => (
                  <tr key={prompt.id} className="border-b">
                    <td className="px-4 py-3">{prompt.title}</td>
                    <td className="px-4 py-3">{prompt.industry}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs ${
                          prompt.score >= 90
                            ? "bg-green-100 text-green-800"
                            : prompt.score >= 80
                              ? "bg-blue-100 text-blue-800"
                              : prompt.score >= 70
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {prompt.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={prompt.isPublic ? "default" : "outline"}>
                        {prompt.isPublic ? "Public" : "Private"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{prompt.user.name}</td>
                    <td className="px-4 py-3">{new Date(prompt.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleTogglePublic(prompt.id)}>
                          {prompt.isPublic ? "Make Private" : "Make Public"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(prompt.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
