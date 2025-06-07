import type { Metadata } from "next"
import PromptDetailsClientPage from "./PromptDetailsClientPage"
import { getPromptDetails } from "@/app/actions/prompt-actions"

export const dynamic = 'force-dynamic'

interface PromptPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PromptPageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const result = await getPromptDetails(resolvedParams.id)

    if (!result?.success || !result?.prompt) {
      return {
        title: "Prompt Not Found",
        description: "The requested AI prompt could not be found. Browse our collection of community-created prompts.",
        robots: {
          index: false,
          follow: true,
        },
      }
    }

    const { prompt } = result
    const score = prompt.score || 0
    const industry = prompt.industry || 'General'
    const description = prompt.description || `A ${industry.toLowerCase()} AI prompt with a quality score of ${score}/100. Perfect for ChatGPT, Claude, and other AI tools.`
    
    // Create a more SEO-friendly title
    const seoTitle = `${prompt.title} - ${industry} AI Prompt (Score: ${score}/100)`

    return {
      title: seoTitle,
      description: description,
      keywords: [
        "AI prompt",
        `${industry} prompt`,
        "ChatGPT prompt",
        "Claude prompt",
        "prompt engineering",
        "AI tools",
        prompt.title.toLowerCase(),
        industry.toLowerCase()
      ],
      authors: [{ name: "Turify Community" }],
      openGraph: {
        title: prompt.title,
        description: description,
        type: "article",
        publishedTime: prompt.created_at,
        modifiedTime: prompt.updated_at,
        section: industry,
        tags: [industry, "AI Prompt", "Prompt Engineering"],
        images: [
          {
            url: `/og-prompt.png?title=${encodeURIComponent(prompt.title)}&score=${score}&industry=${encodeURIComponent(industry)}`,
            width: 1200,
            height: 630,
            alt: `${prompt.title} - AI Prompt`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: prompt.title,
        description: description,
        images: [`/og-prompt.png?title=${encodeURIComponent(prompt.title)}&score=${score}&industry=${encodeURIComponent(industry)}`],
      },
      alternates: {
        canonical: `/prompt/${resolvedParams.id}`,
      },
      robots: {
        index: prompt.is_public !== false, // Only index if public
        follow: true,
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "AI Prompt Details",
      description: "View detailed information about this AI prompt, including evaluation scores and usage examples.",
      robots: {
        index: false,
        follow: true,
      },
    }
  }
}

export default async function PromptPage({ params }: PromptPageProps) {
  const resolvedParams = await params
  // We'll use the client component to handle the data fetching and rendering
  return <PromptDetailsClientPage params={resolvedParams} />
}
