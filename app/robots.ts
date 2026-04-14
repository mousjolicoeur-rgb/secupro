import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/agent/',
          '/boss-admin-portal/',
          '/espace-societe/',
          '/pro/',
          '/api/',
          '/register/',
          '/maintenance/',
        ],
      },
    ],
  }
}
