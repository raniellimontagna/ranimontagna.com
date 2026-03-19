import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  type ContactFormData,
  type ContactFormResponse,
  contactFormSchema,
} from '@/shared/lib/contact-form'
import { checkRateLimit, getRateLimitIdentifier } from '@/shared/lib/rate-limit'

const FORMLY_BASE_URL = 'https://formly.email'
const CONTACT_RATE_LIMIT_PREFIX = 'contact:rate-limit'
const DEFAULT_CONTACT_RATE_LIMIT_MAX = 5
const DEFAULT_CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60_000

const getContactRateLimitMax = (): number => {
  const value = Number(process.env.CONTACT_RATE_LIMIT_MAX)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CONTACT_RATE_LIMIT_MAX
}

const getContactRateLimitWindowMs = (): number => {
  const value = Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CONTACT_RATE_LIMIT_WINDOW_MS
}

const getFormlyFormId = (): string | null => {
  const formId =
    process.env.FORMLY_FORM_ID?.trim() || process.env.NEXT_PUBLIC_FORMLY_FORM_ID?.trim()
  return formId || null
}

const isHoneypotTriggered = (value: unknown): boolean => {
  return typeof value === 'string' && value.trim().length > 0
}

const buildSuccessResponse = (message = 'Email enviado com sucesso!') => {
  return NextResponse.json({ success: true, message } satisfies ContactFormResponse)
}

const submitToFormly = async (
  data: ContactFormData,
  request: NextRequest,
  formId: string,
): Promise<ContactFormResponse> => {
  const payload = {
    access_key: formId,
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    source: 'Portfolio Website - Ranimontagna.com',
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || 'unknown',
    url: request.headers.get('origin') || request.headers.get('referer') || 'unknown',
  }

  const response = await fetch(`${FORMLY_BASE_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    redirect: 'manual',
  })

  // Formly may return a redirect after accepting the submission.
  if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
    return { success: true, message: 'Email enviado com sucesso!' }
  }

  if (response.ok) {
    try {
      const result = (await response.json()) as ContactFormResponse

      if (!result.success) {
        throw new Error(result.message || 'Erro desconhecido ao enviar email')
      }

      return result
    } catch (error) {
      if (error instanceof Error && error.message !== 'Unexpected end of JSON input') {
        throw error
      }

      return { success: true, message: 'Email enviado com sucesso!' }
    }
  }

  const errorText = await response.text()
  throw new Error(`HTTP ${response.status}: ${errorText}`)
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const rateLimitIdentifier = getRateLimitIdentifier(request.headers)
    const rateLimit = await checkRateLimit({
      identifier: rateLimitIdentifier,
      keyPrefix: CONTACT_RATE_LIMIT_PREFIX,
      max: getContactRateLimitMax(),
      windowMs: getContactRateLimitWindowMs(),
    })

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))

      return NextResponse.json(
        {
          success: false,
          message: 'Muitas tentativas. Tente novamente em alguns minutos.',
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSeconds.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            'X-RateLimit-Source': rateLimit.source,
          },
        },
      )
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, message: 'Requisicao invalida.' }, { status: 400 })
    }

    const maybeBody = body as Record<string, unknown>

    // Honeypot returns a success-like response so bots do not learn the trap exists.
    if (isHoneypotTriggered(maybeBody.website)) {
      return buildSuccessResponse()
    }

    const parsed = contactFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dados invalidos.',
          details: parsed.error.flatten(),
        },
        { status: 400 },
      )
    }

    const formId = getFormlyFormId()
    if (!formId) {
      console.error('FORMLY_FORM_ID is not configured')
      return NextResponse.json(
        { success: false, message: 'Servico de contato indisponivel.' },
        { status: 500 },
      )
    }

    const result = await submitToFormly(parsed.data, request, formId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { success: false, message: 'Nao foi possivel enviar a mensagem.' },
      { status: 500 },
    )
  }
}
