import { createHmac, timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { invalidateBlogCache } from '@/features/blog/lib/blog-cache'

const BEARER_PREFIX = 'Bearer '

const secureCompare = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)

  if (aBuffer.length !== bBuffer.length) {
    return false
  }

  return timingSafeEqual(aBuffer, bBuffer)
}

const hasValidBearerToken = (authorizationHeader: string | null, secret: string): boolean => {
  if (!authorizationHeader?.startsWith(BEARER_PREFIX)) {
    return false
  }

  const token = authorizationHeader.slice(BEARER_PREFIX.length).trim()
  if (!token) {
    return false
  }

  return secureCompare(token, secret)
}

const hasValidGithubSignature = (
  signature: string | null,
  body: string,
  secret: string,
): boolean => {
  if (!signature) {
    return false
  }

  const digest = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  return secureCompare(signature, digest)
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-hub-signature-256')
    const authorization = request.headers.get('authorization')
    const secret = process.env.WEBHOOK_SECRET

    if (!secret) {
      console.error('WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const body = signature ? await request.text() : ''
    const isAuthorized =
      hasValidBearerToken(authorization, secret) || hasValidGithubSignature(signature, body, secret)

    if (!isAuthorized) {
      console.error(
        signature ? 'Invalid webhook signature' : 'Missing or invalid revalidate authorization',
      )
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    revalidateTag('posts', 'max')

    try {
      await invalidateBlogCache()
    } catch (error) {
      console.error('blog-cache invalidate failed:', error)
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error revalidating:', error)
    return NextResponse.json(
      {
        error: 'Error revalidating',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
