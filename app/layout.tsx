import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next'
import { WebsiteStructuredData, OrganizationStructuredData, SoftwareApplicationStructuredData } from "@/components/structured-data"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Turify - AI Prompt Engineering Platform",
    template: "%s | Turify"
  },
  description: "Create, evaluate, and share AI prompts with Turify. Generate custom prompts for ChatGPT, Claude, and other AI tools. Join our community of prompt engineers.",
  keywords: [
    "AI prompts",
    "prompt engineering",
    "ChatGPT prompts",
    "Claude prompts",
    "AI tools",
    "prompt generator",
    "prompt evaluation",
    "AI prompt community",
    "custom prompts",
    "prompt optimization"
  ],
  authors: [{ name: "Turify Team" }],
  creator: "Turify",
  publisher: "Turify",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://turify.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Turify - AI Prompt Engineering Platform',
    description: 'Create, evaluate, and share AI prompts with Turify. Generate custom prompts for ChatGPT, Claude, and other AI tools.',
    siteName: 'Turify',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Turify - AI Prompt Engineering Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Turify - AI Prompt Engineering Platform',
    description: 'Create, evaluate, and share AI prompts with Turify. Generate custom prompts for ChatGPT, Claude, and other AI tools.',
    images: ['/og-image.png'],
    creator: '@turifydev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon/safari-pinned-tab.svg', color: '#5bbad5' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://turify.dev'
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <Analytics />
            <SpeedInsights />
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
        
        {/* Structured Data */}
        <WebsiteStructuredData
          url={baseUrl}
          name="Turify"
          description="Create, evaluate, and share AI prompts with Turify. Generate custom prompts for ChatGPT, Claude, and other AI tools."
          logo={`${baseUrl}/logo.png`}
        />
        <OrganizationStructuredData
          name="Turify"
          url={baseUrl}
          description="AI prompt engineering platform helping users create, evaluate, and optimize prompts for various AI tools."
          logo={`${baseUrl}/logo.png`}
        />
        <SoftwareApplicationStructuredData
          name="Turify"
          url={baseUrl}
          description="AI prompt engineering platform for creating and optimizing prompts"
          applicationCategory="ProductivityApplication"
          operatingSystem="Web Browser"
          offers={{
            price: "0",
            priceCurrency: "USD"
          }}
        />
      </body>
    </html>
  )
}
