import type { Metadata } from "next"
import PromptsPageClient from "./PromptsPageClient"

export const metadata: Metadata = {
  title: "Explore AI Prompts",
  description: "Discover and use high-quality AI prompts created by our community. Browse prompts for ChatGPT, Claude, and other AI tools across various industries and use cases.",
  keywords: [
    "AI prompts",
    "ChatGPT prompts",
    "Claude prompts",
    "prompt library",
    "AI prompt examples",
    "prompt templates",
    "community prompts",
    "prompt collection"
  ],
  openGraph: {
    title: "Explore AI Prompts - Turify",
    description: "Discover and use high-quality AI prompts created by our community. Browse prompts for ChatGPT, Claude, and other AI tools.",
    type: "website",
    images: [
      {
        url: "/og-prompts.png",
        width: 1200,
        height: 630,
        alt: "Explore AI Prompts on Turify",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore AI Prompts - Turify",
    description: "Discover and use high-quality AI prompts created by our community.",
    images: ["/og-prompts.png"],
  },
}

export default async function PromptsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; industry?: string; minScore?: string; search?: string }>
}) {
  const resolvedSearchParams = await searchParams
  return <PromptsPageClient searchParams={resolvedSearchParams} />
}
