import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  type ContactFormData,
  type ContactFormResponse,
  contactFormSchema,
} from '@/shared/lib/contact-form'
import { checkRateLimit, getRateLimitIdentifier } from '@/shared/lib/rate-limit'
import { isTrustedBrowserRequest, readBoundedJsonBody } from '@/shared/lib/request-security'

const FORMLY_BASE_URL = 'https://formly.email'
const CONTACT_RATE_LIMIT_PREFIX = 'contact:rate-limit'
const DEFAULT_CONTACT_RATE_LIMIT_MAX = 5
const DEFAULT_CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60_000
const MAX_CONTACT_BODY_BYTES = 16 * 1024
const DEFAULT_FORMLY_TIMEOUT_MS = 7_500

type ContactProviderFailureCategory = 'http' | 'invalid-response' | 'network' | 'timeout'

class ContactProviderError extends Error {
  constructor(
    readonly category: ContactProviderFailureCategory,
    readonly status: number | null,
    readonly traceId: string,
  ) {
    super('Contact provider request failed')
  }
}

const getFormlyTimeoutMs = (): number => {
  const value = Number(process.env.FORMLY_TIMEOUT_MS)
  return Number.isSafeInteger(value) && value > 0
    ? Math.min(value, 10_000)
    : DEFAULT_FORMLY_TIMEOUT_MS
}

const getContactRateLimitMax = (): number => {
  const value = Number(process.env.CONTACT_RATE_LIMIT_MAX)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CONTACT_RATE_LIMIT_MAX
}

const getContactRateLimitWindowMs = (): number => {
  const value = Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS)
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_CONTACT_RATE_LIMIT_WINDOW_MS
}

const getFormlyFormId = (): string | null => {
  const formId = process.env.FORMLY_FORM_ID?.trim()
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
  traceId: string,
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

  let response: Response
  try {
    response = await fetch(`${FORMLY_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'manual',
      signal: AbortSignal.timeout(getFormlyTimeoutMs()),
    })
  } catch (error) {
    const category =
      error instanceof DOMException && ['AbortError', 'TimeoutError'].includes(error.name)
        ? 'timeout'
        : 'network'
    throw new ContactProviderError(category, null, traceId)
  }

  if (!response.ok) {
    throw new ContactProviderError('http', response.status, traceId)
  }

  let result: unknown
  try {
    result = await response.json()
  } catch {
    throw new ContactProviderError('invalid-response', response.status, traceId)
  }

  if (!result || typeof result !== 'object' || !('success' in result) || result.success !== true) {
    throw new ContactProviderError('invalid-response', response.status, traceId)
  }

  const confirmed = result as Record<string, unknown>
  return {
    success: true,
    message:
      typeof confirmed.message === 'string' ? confirmed.message : 'Email enviado com sucesso!',
    ...(typeof confirmed.id === 'string' ? { id: confirmed.id } : {}),
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const traceId = crypto.randomUUID()
  try {
    if (!isTrustedBrowserRequest(request)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

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

    const bodyResult = await readBoundedJsonBody(request, MAX_CONTACT_BODY_BYTES)
    if (bodyResult.status === 'too-large') {
      return NextResponse.json(
        { success: false, message: 'Request body too large' },
        { status: 413 },
      )
    }

    if (bodyResult.status === 'invalid') {
      return NextResponse.json({ success: false, message: 'Requisicao invalida.' }, { status: 400 })
    }

    const body = bodyResult.value
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
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

    const result = await submitToFormly(parsed.data, request, formId, traceId)
    return NextResponse.json(result)
  } catch (error) {
    const failure =
      error instanceof ContactProviderError
        ? { category: error.category, status: error.status, traceId: error.traceId }
        : { category: 'unexpected', status: null, traceId }
    console.error('Contact API failure', failure)
    return NextResponse.json(
      { success: false, message: 'Nao foi possivel enviar a mensagem.' },
      { status: 500 },
    )
  }
}
