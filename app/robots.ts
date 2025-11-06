import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/reader/'],
      },
    ],
    sitemap: 'https://shelvd-demo.vercel.app/sitemap.xml',
  }
}
