import { CHAT_DEFAULT_TOTAL_DEADLINE_MS, CHAT_MAX_TOTAL_DEADLINE_MS } from './chat.constants'

export type ChatProviderId = 'deepseek' | 'openrouter'
export type ProviderStreamFormat = 'openai-sse'

export type ProviderAttempt = {
  provider: ChatProviderId
  model: string
  format: ProviderStreamFormat
  response: Response
  durationMs: number
  firstByteMs: number
}

export type ProviderFailureCategory =
  | 'disabled'
  | 'auth'
  | 'invalid'
  | 'rate-limit'
  | 'safety'
  | 'cancelled'
  | 'timeout'
  | 'upstream'

export type ProviderFailure = {
  ok: false
  provider: ChatProviderId
  model: string
  category: ProviderFailureCategory
  chainable: boolean
  durationMs: number
  firstByteMs: null
}

export type ProviderResult = { ok: true; attempt: ProviderAttempt } | ProviderFailure

export const CHAT_GENERATION_POLICY = {
  maxOutputTokens: 600,
  temperature: 0.1,
} as const

export type ChatProviderEnvironment = Readonly<Record<string, string | undefined>>

export type ChatProviderConfig = {
  models: Record<ChatProviderId, string>
  fallbackEnabled: Record<Exclude<ChatProviderId, 'deepseek'>, boolean>
  totalDeadlineMs: number
}

const configuredValue = (
  environment: ChatProviderEnvironment,
  name: string,
  fallback: string,
): string => environment[name]?.trim() || fallback

const DEFAULT_OPENROUTER_MODEL = 'google/gemma-3-4b-it:free'
const APPROVED_OPENROUTER_MODELS = new Set<string>([DEFAULT_OPENROUTER_MODEL])

const configuredOpenRouterModel = (environment: ChatProviderEnvironment): string => {
  const configured = configuredValue(
    environment,
    'OPENROUTER_MODEL_PRIMARY',
    DEFAULT_OPENROUTER_MODEL,
  )

  return APPROVED_OPENROUTER_MODELS.has(configured) ? configured : DEFAULT_OPENROUTER_MODEL
}

export function createChatProviderConfig(environment: ChatProviderEnvironment): ChatProviderConfig {
  const configuredDeadline = Number(environment.CHAT_TOTAL_DEADLINE_MS)

  return {
    fallbackEnabled: {
      openrouter: environment.CHAT_ENABLE_OPENROUTER_FALLBACK === 'true',
    },
    models: {
      deepseek: configuredValue(environment, 'DEEPSEEK_MODEL', 'deepseek-chat'),
      openrouter: configuredOpenRouterModel(environment),
    },
    totalDeadlineMs:
      Number.isSafeInteger(configuredDeadline) &&
      configuredDeadline > 0 &&
      configuredDeadline <= CHAT_MAX_TOTAL_DEADLINE_MS
        ? configuredDeadline
        : CHAT_DEFAULT_TOTAL_DEADLINE_MS,
  }
}

export type ChatExecutionContext = {
  signal: AbortSignal
  clientSignal: AbortSignal
  deadlineSignal: AbortSignal
  startedAt: number
  deadlineAt: number
}

type ExecutionContextOptions = {
  now?: () => number
  createDeadlineSignal?: (deadlineMs: number) => AbortSignal
}

const CLIENT_ABORT_REASON = Symbol('chat-client-cancelled')
const DEADLINE_ABORT_REASON = Symbol('chat-total-deadline')

export function createChatExecutionContext(
  clientSignal: AbortSignal,
  deadlineMs: number,
  options: ExecutionContextOptions = {},
): ChatExecutionContext {
  const now = options.now ?? Date.now
  const startedAt = now()
  const deadlineSignal = (options.createDeadlineSignal ?? AbortSignal.timeout)(deadlineMs)
  const combinedController = new AbortController()

  function cleanupAbortListeners(): void {
    clientSignal.removeEventListener('abort', handleClientAbort)
    deadlineSignal.removeEventListener('abort', handleDeadlineAbort)
  }

  function abortCombined(reason: typeof CLIENT_ABORT_REASON | typeof DEADLINE_ABORT_REASON): void {
    if (combinedController.signal.aborted) return
    cleanupAbortListeners()
    combinedController.abort(reason)
  }

  function handleClientAbort(): void {
    abortCombined(CLIENT_ABORT_REASON)
  }

  function handleDeadlineAbort(): void {
    abortCombined(DEADLINE_ABORT_REASON)
  }

  if (clientSignal.aborted) {
    handleClientAbort()
  } else if (deadlineSignal.aborted) {
    handleDeadlineAbort()
  } else {
    clientSignal.addEventListener('abort', handleClientAbort, { once: true })
    deadlineSignal.addEventListener('abort', handleDeadlineAbort, { once: true })
  }

  return {
    clientSignal,
    deadlineAt: startedAt + deadlineMs,
    deadlineSignal,
    signal: combinedController.signal,
    startedAt,
  }
}

export type ChatInterruptionCategory = Extract<ProviderFailureCategory, 'cancelled' | 'timeout'>

export function getChatInterruptionCategory(
  execution: ChatExecutionContext,
): ChatInterruptionCategory | null {
  if (!execution.signal.aborted) return null
  if (execution.signal.reason === DEADLINE_ABORT_REASON) return 'timeout'
  if (execution.signal.reason === CLIENT_ABORT_REASON) return 'cancelled'

  if (execution.clientSignal.aborted && !execution.deadlineSignal.aborted) return 'cancelled'
  if (execution.deadlineSignal.aborted && !execution.clientSignal.aborted) return 'timeout'
  return null
}

export type ProviderAdapterInput = {
  execution: ChatExecutionContext
  systemPrompt: string
  userContent: string
}

export type ProviderAdapter = (input: ProviderAdapterInput) => Promise<ProviderResult>

export type ChatProviderAdapters = {
  callDeepSeek: ProviderAdapter
  callOpenRouter: ProviderAdapter
}

type ProviderAdapterDependencies = {
  environment: ChatProviderEnvironment
  fetch: typeof fetch
  now?: () => number
}

type AdapterRequest = ProviderAdapterInput & {
  format: ProviderStreamFormat
  model: string
  provider: ChatProviderId
  request: {
    url: string
    init: RequestInit
  }
}

const elapsedSince = (startedAt: number, now: () => number): number =>
  Math.max(0, now() - startedAt)

const failure = (
  provider: ChatProviderId,
  model: string,
  category: ProviderFailureCategory,
  durationMs: number,
): ProviderFailure => ({
  category,
  chainable: ['disabled', 'auth', 'rate-limit', 'upstream'].includes(category),
  durationMs,
  firstByteMs: null,
  model,
  ok: false,
  provider,
})

const categoryForStatus = (status: number): ProviderFailureCategory => {
  if (status === 401) return 'auth'
  if (status === 403) return 'safety'
  if (status === 400 || status === 422) return 'invalid'
  if (status === 429) return 'rate-limit'
  return 'upstream'
}

const cancelUnreadBody = async (response: Response): Promise<void> => {
  try {
    await response.body?.cancel()
  } catch {
    // Body cleanup is best effort and never exposes upstream details.
  }
}

const executeProviderRequest = async (
  request: AdapterRequest,
  fetchProvider: typeof fetch,
  now: () => number,
): Promise<ProviderResult> => {
  const startedAt = now()
  const interruptedBeforeFetch = getChatInterruptionCategory(request.execution)
  if (interruptedBeforeFetch) {
    return failure(
      request.provider,
      request.model,
      interruptedBeforeFetch,
      elapsedSince(startedAt, now),
    )
  }

  try {
    const response = await fetchProvider(request.request.url, {
      ...request.request.init,
      signal: request.execution.signal,
    })
    const durationMs = elapsedSince(startedAt, now)
    const interruptedAfterFetch = getChatInterruptionCategory(request.execution)
    if (interruptedAfterFetch) {
      await cancelUnreadBody(response)
      return failure(request.provider, request.model, interruptedAfterFetch, durationMs)
    }

    if (!response.ok) {
      await cancelUnreadBody(response)
      return failure(
        request.provider,
        request.model,
        categoryForStatus(response.status),
        durationMs,
      )
    }

    return {
      attempt: {
        durationMs,
        firstByteMs: durationMs,
        format: request.format,
        model: request.model,
        provider: request.provider,
        response,
      },
      ok: true,
    }
  } catch {
    const durationMs = elapsedSince(startedAt, now)
    const interrupted = getChatInterruptionCategory(request.execution)
    return failure(request.provider, request.model, interrupted ?? 'upstream', durationMs)
  }
}

const openAiBody = (model: string, input: ProviderAdapterInput) => ({
  max_tokens: CHAT_GENERATION_POLICY.maxOutputTokens,
  messages: [
    { role: 'system', content: input.systemPrompt },
    { role: 'user', content: input.userContent },
  ],
  model,
  stream: true,
  temperature: CHAT_GENERATION_POLICY.temperature,
})

export function createChatProviderAdapters(
  config: ChatProviderConfig,
  dependencies: ProviderAdapterDependencies,
): ChatProviderAdapters {
  const now = dependencies.now ?? Date.now

  const disabledResult = (
    provider: Exclude<ChatProviderId, 'deepseek'>,
    startedAt: number,
  ): ProviderFailure =>
    failure(provider, config.models[provider], 'disabled', elapsedSince(startedAt, now))

  const missingKeyResult = (provider: ChatProviderId, startedAt: number): ProviderFailure =>
    failure(provider, config.models[provider], 'disabled', elapsedSince(startedAt, now))

  const interruptedResult = (
    provider: ChatProviderId,
    input: ProviderAdapterInput,
  ): ProviderFailure | null => {
    const category = getChatInterruptionCategory(input.execution)
    if (!category) return null

    const startedAt = now()
    return failure(provider, config.models[provider], category, elapsedSince(startedAt, now))
  }

  const callDeepSeek: ProviderAdapter = async (input) => {
    const interrupted = interruptedResult('deepseek', input)
    if (interrupted) return interrupted

    const apiKey = dependencies.environment.DEEPSEEK_API_KEY?.trim()
    if (!apiKey) return missingKeyResult('deepseek', now())

    return executeProviderRequest(
      {
        ...input,
        format: 'openai-sse',
        model: config.models.deepseek,
        provider: 'deepseek',
        request: {
          init: {
            body: JSON.stringify(openAiBody(config.models.deepseek, input)),
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
          url: 'https://api.deepseek.com/chat/completions',
        },
      },
      dependencies.fetch,
      now,
    )
  }

  const callOpenRouter: ProviderAdapter = async (input) => {
    const interrupted = interruptedResult('openrouter', input)
    if (interrupted) return interrupted

    if (!config.fallbackEnabled.openrouter) return disabledResult('openrouter', now())

    const apiKey = dependencies.environment.OPENROUTER_API_KEY?.trim()
    if (!apiKey) return missingKeyResult('openrouter', now())

    return executeProviderRequest(
      {
        ...input,
        format: 'openai-sse',
        model: config.models.openrouter,
        provider: 'openrouter',
        request: {
          init: {
            body: JSON.stringify({
              ...openAiBody(config.models.openrouter, input),
              provider: { data_collection: 'deny', zdr: true },
            }),
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://ranimontagna.com',
              'X-Title': 'Rani Digital',
            },
            method: 'POST',
          },
          url: 'https://openrouter.ai/api/v1/chat/completions',
        },
      },
      dependencies.fetch,
      now,
    )
  }

  return { callDeepSeek, callOpenRouter }
}
