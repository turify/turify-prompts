import Script from 'next/script'

interface WebsiteStructuredDataProps {
  url: string
  name: string
  description: string
  logo?: string
}

export function WebsiteStructuredData({ url, name, description, logo }: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "description": description,
    "url": url,
    "logo": logo,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${url}/prompts?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/turifydev",
      "https://github.com/turify"
    ]
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

interface OrganizationStructuredDataProps {
  name: string
  url: string
  logo?: string
  description: string
}

export function OrganizationStructuredData({ name, url, logo, description }: OrganizationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/turifydev",
      "https://github.com/turify"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@turify.dev"
    }
  }

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

interface SoftwareApplicationStructuredDataProps {
  name: string
  url: string
  description: string
  applicationCategory: string
  operatingSystem: string
  offers?: {
    price: string
    priceCurrency: string
  }
}

export function SoftwareApplicationStructuredData({ 
  name, 
  url, 
  description, 
  applicationCategory, 
  operatingSystem,
  offers 
}: SoftwareApplicationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "url": url,
    "description": description,
    "applicationCategory": applicationCategory,
    "operatingSystem": operatingSystem,
    "offers": offers ? {
      "@type": "Offer",
      "price": offers.price,
      "priceCurrency": offers.priceCurrency
    } : undefined,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  return (
    <Script
      id="software-application-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

interface CreativeWorkStructuredDataProps {
  name: string
  description: string
  author: string
  dateCreated: string
  dateModified: string
  url: string
  industry?: string
  keywords?: string[]
}

export function CreativeWorkStructuredData({
  name,
  description,
  author,
  dateCreated,
  dateModified,
  url,
  industry,
  keywords
}: CreativeWorkStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": name,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "dateCreated": dateCreated,
    "dateModified": dateModified,
    "url": url,
    "genre": industry,
    "keywords": keywords?.join(", "),
    "publisher": {
      "@type": "Organization",
      "name": "Turify"
    },
    "isAccessibleForFree": true,
    "usageInfo": "Free to use for personal and commercial purposes"
  }

  return (
    <Script
      id="creative-work-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

interface BreadcrumbStructuredDataProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
} 