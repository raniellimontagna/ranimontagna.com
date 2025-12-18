import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const signature = request.headers.get('x-hub-signature-256')
    const secret = process.env.WEBHOOK_SECRET

    if (!secret) {
      console.error('WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Validate GitHub signature (optional but recommended)
    if (signature) {
      const body = await request.text()
      const crypto = await import('node:crypto')
      const hmac = crypto.createHmac('sha256', secret)
      const digest = `sha256=${hmac.update(body).digest('hex')}`

      if (signature !== digest) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Revalidate blog posts cache
    revalidateTag('posts', 'max')

    console.log('Blog posts cache revalidated successfully')

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
