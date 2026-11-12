import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './shared/config/i18n/routing'
import { isIndexingDisabled, withNoindexHeader } from './shared/lib/seo/indexing'

const intlMiddleware = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  return withNoindexHeader(intlMiddleware(request), isIndexingDisabled(process.env))
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
