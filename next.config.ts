import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { addCompileHints } from './scripts/compile-hints.mjs'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com https://*.google-analytics.com https://vercel.live https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://vercel.live",
  "connect-src 'self' https://*.sentry.io https://*.ingest.sentry.io https://generativelanguage.googleapis.com https://openrouter.ai https://api.groq.com https://*.google-analytics.com https://*.googletagmanager.com https://formly.email https://*.upstash.io https://vercel.live wss://vercel.live https://cloudflareinsights.com",
  "worker-src 'self' blob:",
  'frame-src https://vercel.live',
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const nextConfig: NextConfig = {
  turbopack: { root: projectRoot },
  // Vercel's adapter turns immutable assets on: chunks named by a content hash
  // and shared across deployments. The compile hints change their content, so
  // they need per-deployment chunks.
  supportsImmutableAssets: false,
  compiler: {
    // Inside `next build`, before Vercel's adapter collects the static files.
    runAfterProductionCompile: ({ distDir }) => addCompileHints(distDir),
  },
  experimental: {
    optimizePackageImports: ['@solar-icons/react', 'framer-motion', 'motion'],
  },
  redirects: async () => {
    return [
      {
        source: '/pt',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pt/blog',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/pt/blog/:slug',
        destination: '/blog/:slug',
        permanent: true,
      },
      {
        source: '/pt/projects',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/blog/eu-nao-conhecia-a-lemon',
        destination: '/blog/um-novo-capitulo-na-lemon',
        permanent: true,
      },
      {
        source: '/:locale(en|es)/blog/eu-nao-conhecia-a-lemon',
        destination: '/:locale/blog/um-novo-capitulo-na-lemon',
        permanent: true,
      },
    ]
  },
  images: {
    qualities: [50, 75, 100],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.ranimontagna.com' },
      { protocol: 'https', hostname: 'cdn.ranimontagna.com' },
    ],
  },
  compress: true,
  poweredByHeader: false,
  headers: async () => {
    const baseHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Content-Security-Policy', value: contentSecurityPolicy },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ]

    if (isProd) {
      baseHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      })
    }

    return [
      { source: '/(.*)', headers: baseHeaders },
      {
        // Files in public/ keep their names when they change, so they get a day
        // of cache instead of a year. /_next/ is left to Next.js, which marks
        // only files that exist as immutable: the old one-year rule also covered
        // 404s, and Cloudflare kept one for a chunk that a later deploy needed.
        source: '/:path((?!_next/).*)\\.(css|js|jpg|jpeg|png|gif|ico|svg|webp|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin('./src/shared/config/i18n/request.ts')
export default withSentryConfig(withNextIntl(nextConfig), {
  org: 'raniellimontagna',
  project: 'ranimontagnadotcom',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    reactComponentAnnotation: { enabled: true },
    treeshake: {
      removeDebugLogging: true,
    },
  },
  sourcemaps: { disable: true },
})
