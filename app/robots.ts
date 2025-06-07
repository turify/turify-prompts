import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://turify.dev'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/prompts',
          '/prompt/',
          '/privacy',
          '/terms',
          '/login',
          '/signup',
        ],
        disallow: [
          '/dashboard',
          '/profile',
          '/settings',
          '/admin',
          '/api/',
          '/auth/',
          '/verify-request',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
} 