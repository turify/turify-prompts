import { requireAuth } from "@/app/actions/auth-actions"
import { BlogPromotionClient } from "./BlogPromotionClient"

export const metadata = {
  title: "Blog Promotion Program - Get Premium Membership",
  description: "Write about Turify on your blog and get 6 months of premium membership with priority queue and advanced AI models access.",
}

export default async function BlogPromotionPage() {
  // Check if user is authenticated
  const user = await requireAuth()

  return <BlogPromotionClient user={user} />
} 