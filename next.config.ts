import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@solar-icons/react', 'framer-motion', 'motion'],
  },
  // Redirect URLs without locale to default locale (pt) with 301 permanent
  redirects: async () => {
    return [
      {
        source: '/blog',
        destination: '/pt/blog',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/pt/blog/:slug',
        permanent: true,
      },
    ]
  },
  images: {
    qualities: [50, 75, 100],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)\\.(css|js|jpg|jpeg|png|gif|ico|svg|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin('./src/shared/config/i18n/request.ts')
export default withNextIntl(nextConfig)
