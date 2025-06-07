"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AdminUsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        // Simulate fetching users
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setUsers([
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "admin",
            createdAt: "2023-04-15T10:30:00Z",
            lastLogin: "2023-05-10T14:20:00Z",
            promptsCount: 12,
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "user",
            createdAt: "2023-04-18T09:15:00Z",
            lastLogin: "2023-05-09T16:45:00Z",
            promptsCount: 8,
          },
          {
            id: "3",
            name: "Alex Johnson",
            email: "alex@example.com",
            role: "user",
            createdAt: "2023-04-20T11:45:00Z",
            lastLogin: "2023-05-08T10:30:00Z",
            promptsCount: 5,
          },
          {
            id: "4",
            name: "Sam Wilson",
            email: "sam@example.com",
            role: "user",
            createdAt: "2023-04-22T14:20:00Z",
            lastLogin: "2023-05-07T09:15:00Z",
            promptsCount: 3,
          },
          {
            id: "5",
            name: "Taylor Brown",
            email: "taylor@example.com",
            role: "user",
            createdAt: "2023-04-25T16:30:00Z",
            lastLogin: "2023-05-06T11:45:00Z",
            promptsCount: 7,
          },
        ])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users")
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== id))
    }
  }

  const handleToggleRole = (id) => {
    setUsers(users.map((user) => (user.id === id ? { ...user, role: user.role === "admin" ? "user" : "admin" } : user)))
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
          <h2 className="text-xl font-bold">All Users</h2>
          <p className="text-sm text-muted-foreground">Manage all users in the system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button>Add User</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-left font-medium">Last Login</th>
                  <th className="px-4 py-3 text-left font-medium">Prompts</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === "admin" ? "default" : "outline"}>
                        {user.role === "admin" ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(user.lastLogin).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{user.promptsCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleToggleRole(user.id)}>
                          {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
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
