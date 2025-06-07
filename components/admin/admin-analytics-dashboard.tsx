"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AdminAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Simulate fetching analytics data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setAnalyticsData({
          totalUsers: 120,
          totalPrompts: 450,
          activeUsers: 85,
          newUsers: 12,
          pageViews: 1250,
          promptCreations: 45,
          promptEvaluations: 120,
          dailyStats: [
            { date: "2023-05-01", users: 10, prompts: 25, evaluations: 15 },
            { date: "2023-05-02", users: 12, prompts: 30, evaluations: 18 },
            { date: "2023-05-03", users: 15, prompts: 35, evaluations: 22 },
            { date: "2023-05-04", users: 18, prompts: 40, evaluations: 25 },
            { date: "2023-05-05", users: 20, prompts: 45, evaluations: 30 },
            { date: "2023-05-06", users: 22, prompts: 50, evaluations: 35 },
            { date: "2023-05-07", users: 25, prompts: 55, evaluations: 40 },
          ],
        })
        setLoading(false)
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+{analyticsData?.newUsers || 0} new users this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalPrompts || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData?.promptCreations || 0} new prompts this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analyticsData?.activeUsers / analyticsData?.totalUsers) * 100) || 0}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.pageViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              ~{Math.round(analyticsData?.pageViews / 7) || 0} views per day
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <div className="text-center text-sm text-muted-foreground">
              Chart would be displayed here in a real implementation
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {analyticsData?.dailyStats?.map((day, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-xs text-muted-foreground">{day.date.split("-")[2]}</div>
                  <div
                    className="mt-1 h-20 w-full rounded-t-md bg-primary"
                    style={{ height: `${day.users * 4}px` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>May 1</span>
              <span>May 7</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
