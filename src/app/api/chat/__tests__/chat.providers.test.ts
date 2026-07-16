import {
  CHAT_GENERATION_POLICY,
  type ChatExecutionContext,
  type ChatProviderEnvironment,
  createChatExecutionContext,
  createChatProviderAdapters,
  createChatProviderConfig,
  getChatInterruptionCategory,
  type ProviderAdapter,
} from '../chat.providers'

const createExecution = (
  clientController = new AbortController(),
  deadlineController = new AbortController(),
): ChatExecutionContext =>
  createChatExecutionContext(clientController.signal, 12_000, {
    createDeadlineSignal: () => deadlineController.signal,
    now: () => 0,
  })

const enabledEnvironment = (): ChatProviderEnvironment => ({
  CHAT_ENABLE_GEMINI_FALLBACK: 'true',
  CHAT_ENABLE_GROQ_FALLBACK: 'true',
  CHAT_ENABLE_OPENROUTER_FALLBACK: 'true',
  DEEPSEEK_API_KEY: 'deepseek-test-key',
  GEMINI_API_KEY: 'gemini-test-key',
  GROQ_API_KEY: 'groq-test-key',
  OPENROUTER_API_KEY: 'openrouter-test-key',
})

const createAdapterHarness = (environment = enabledEnvironment()) => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 200 }))
  const now = vi.fn().mockReturnValueOnce(10).mockReturnValueOnce(35)
  const config = createChatProviderConfig(environment)
  const adapters = createChatProviderAdapters(config, {
    environment,
    fetch: fetchMock as typeof fetch,
    now,
  })

  return { adapters, config, fetchMock }
}

const invoke = (adapter: ProviderAdapter, execution = createExecution()) =>
  adapter({
    execution,
    systemPrompt: 'system policy',
    userContent: 'visitor payload',
  })

describe('chat provider configuration', () => {
  it('pins models and disables optional fallbacks by default', () => {
    const config = createChatProviderConfig({})

    expect(config).toEqual({
      fallbackEnabled: {
        gemini: false,
        groq: false,
        openrouter: false,
      },
      models: {
        deepseek: 'deepseek-chat',
        gemini: 'gemini-2.5-flash-lite',
        groq: 'llama-3.1-8b-instant',
        openrouter: 'google/gemma-3-4b-it:free',
      },
      totalDeadlineMs: 12_000,
    })
    expect(config).not.toHaveProperty('deepseekEnabled')
    expect(JSON.stringify(config)).not.toContain('openrouter/auto')
  })

  it('resolves model, deadline, and fallback overrides from the injected environment', () => {
    expect(
      createChatProviderConfig({
        CHAT_ENABLE_GEMINI_FALLBACK: 'true',
        CHAT_ENABLE_GROQ_FALLBACK: 'true',
        CHAT_ENABLE_OPENROUTER_FALLBACK: 'true',
        CHAT_TOTAL_DEADLINE_MS: '9000',
        DEEPSEEK_MODEL: 'deepseek-custom',
        GEMINI_MODEL: 'gemini-custom',
        GROQ_MODEL: 'groq-custom',
        OPENROUTER_MODEL_PRIMARY: 'google/gemma-3-4b-it:free',
      }),
    ).toEqual({
      fallbackEnabled: { gemini: true, groq: true, openrouter: true },
      models: {
        deepseek: 'deepseek-custom',
        gemini: 'gemini-custom',
        groq: 'groq-custom',
        openrouter: 'google/gemma-3-4b-it:free',
      },
      totalDeadlineMs: 9000,
    })
  })

  it('accepts the explicit operational deadline ceiling', () => {
    expect(createChatProviderConfig({ CHAT_TOTAL_DEADLINE_MS: '60000' }).totalDeadlineMs).toBe(
      60_000,
    )
  })

  it.each([
    '9000.5',
    '0',
    '-1',
    'NaN',
    'Infinity',
    '60001',
    '9007199254740991',
    '9007199254740992',
  ])('falls back to 12 seconds for an invalid total deadline of %s', (configuredDeadline) => {
    expect(
      createChatProviderConfig({ CHAT_TOTAL_DEADLINE_MS: configuredDeadline }).totalDeadlineMs,
    ).toBe(12_000)
  })

  it.each([
    'openrouter/auto',
    ' OpenRouter/Auto ',
    '\tOPENROUTER/AUTO\n',
    ' openrouter/auto:free ',
    'openrouter/free',
    'openrouter/fusion',
    'openrouter/pareto-code',
    'unknown/provider-model',
    'google/gemma-3-4b-it:free:variant',
  ])('rejects the unapproved OpenRouter model override %j', (configuredModel) => {
    expect(
      createChatProviderConfig({ OPENROUTER_MODEL_PRIMARY: configuredModel }).models.openrouter,
    ).toBe('google/gemma-3-4b-it:free')
  })
})

describe('shared chat execution context', () => {
  it('combines the original client and deadline signals exactly once', () => {
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    const createDeadlineSignal = vi.fn().mockReturnValue(deadlineController.signal)

    const context = createChatExecutionContext(clientController.signal, 8_000, {
      createDeadlineSignal,
      now: () => 1_000,
    })

    expect(createDeadlineSignal).toHaveBeenCalledOnce()
    expect(createDeadlineSignal).toHaveBeenCalledWith(8_000)
    expect(context).toMatchObject({
      clientSignal: clientController.signal,
      deadlineAt: 9_000,
      deadlineSignal: deadlineController.signal,
      startedAt: 1_000,
    })
    expect(context.signal.aborted).toBe(false)
    expect(getChatInterruptionCategory(context)).toBeNull()

    deadlineController.abort()
    expect(context.signal.aborted).toBe(true)
    expect(getChatInterruptionCategory(context)).toBe('timeout')
  })

  it.each([
    ['deadline', 'timeout'],
    ['client', 'cancelled'],
  ] as const)('preserves %s as the first abort cause', (firstCause, expectedCategory) => {
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    const context = createExecution(clientController, deadlineController)

    if (firstCause === 'deadline') {
      deadlineController.abort()
      clientController.abort()
    } else {
      clientController.abort()
      deadlineController.abort()
    }

    expect(getChatInterruptionCategory(context)).toBe(expectedCategory)
  })

  it.each([
    ['deadline', 'timeout'],
    ['client', 'cancelled'],
  ] as const)('recognizes an already-aborted %s signal when creating the context', (abortedSignal, expectedCategory) => {
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    if (abortedSignal === 'deadline') deadlineController.abort()
    else clientController.abort()

    const context = createExecution(clientController, deadlineController)

    expect(context.signal.aborted).toBe(true)
    expect(getChatInterruptionCategory(context)).toBe(expectedCategory)
  })

  it('removes both one-shot listeners after the first abort', () => {
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    const clientRemove = vi.spyOn(clientController.signal, 'removeEventListener')
    const deadlineRemove = vi.spyOn(deadlineController.signal, 'removeEventListener')

    createExecution(clientController, deadlineController)
    deadlineController.abort()

    expect(clientRemove).toHaveBeenCalledOnce()
    expect(deadlineRemove).toHaveBeenCalledOnce()
  })
})

describe('provider adapter contracts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['deepseek', 'callDeepSeek', 'https://api.deepseek.com/chat/completions'],
    ['openrouter', 'callOpenRouter', 'https://openrouter.ai/api/v1/chat/completions'],
    ['groq', 'callGroq', 'https://api.groq.com/openai/v1/chat/completions'],
  ] as const)('sends authoritative OpenAI-compatible messages through %s', async (provider, adapterName, expectedUrl) => {
    const { adapters, fetchMock } = createAdapterHarness()

    const result = await invoke(adapters[adapterName])

    expect(result).toMatchObject({
      ok: true,
      attempt: {
        durationMs: 25,
        firstByteMs: 25,
        format: 'openai-sse',
        provider,
      },
    })
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const requestBody = JSON.parse(String(requestInit.body))
    expect(requestUrl).toBe(expectedUrl)
    expect(requestBody.messages).toEqual([
      { role: 'system', content: 'system policy' },
      { role: 'user', content: 'visitor payload' },
    ])
    expect(requestBody.temperature).toBe(CHAT_GENERATION_POLICY.temperature)
    expect(requestBody.max_tokens).toBe(CHAT_GENERATION_POLICY.maxOutputTokens)
  })

  it('uses one pinned OpenRouter model with strict privacy routing', async () => {
    const { adapters, fetchMock } = createAdapterHarness()

    await invoke(adapters.callOpenRouter)

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit
    const requestBody = JSON.parse(String(requestInit.body))
    expect(requestBody.model).toBe('google/gemma-3-4b-it:free')
    expect(requestBody.provider).toEqual({ data_collection: 'deny', zdr: true })
    expect(JSON.stringify(requestBody)).not.toContain('openrouter/auto')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('keeps the Gemini key out of the URL and sends a system instruction', async () => {
    const { adapters, fetchMock } = createAdapterHarness()

    const result = await invoke(adapters.callGemini)

    expect(result).toMatchObject({
      ok: true,
      attempt: { format: 'gemini-sse', provider: 'gemini' },
    })
    const [requestUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    const requestBody = JSON.parse(String(requestInit.body))
    expect(requestUrl).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse',
    )
    expect(requestUrl).not.toContain('gemini-test-key')
    expect(requestInit.headers).toMatchObject({
      'Content-Type': 'application/json',
      'x-goog-api-key': 'gemini-test-key',
    })
    expect(requestBody.system_instruction).toEqual({ parts: [{ text: 'system policy' }] })
    expect(requestBody.contents).toEqual([{ role: 'user', parts: [{ text: 'visitor payload' }] }])
    expect(requestBody.generationConfig).toMatchObject({
      maxOutputTokens: 600,
      temperature: 0.1,
    })
  })

  it.each([
    ['callGemini', 'gemini', 'GEMINI_API_KEY'],
    ['callOpenRouter', 'openrouter', 'OPENROUTER_API_KEY'],
    ['callGroq', 'groq', 'GROQ_API_KEY'],
  ] as const)('returns disabled for %s without reading its credential when its flag is false', async (adapterName, provider, credentialName) => {
    const reads: PropertyKey[] = []
    const environment = new Proxy<ChatProviderEnvironment>(
      { [credentialName]: 'must-not-be-read' },
      {
        get(target, property, receiver) {
          reads.push(property)
          return Reflect.get(target, property, receiver)
        },
      },
    )
    const config = createChatProviderConfig(environment)
    reads.length = 0
    const fetchMock = vi.fn()
    const adapters = createChatProviderAdapters(config, {
      environment,
      fetch: fetchMock as typeof fetch,
    })

    const result = await invoke(adapters[adapterName])

    expect(result).toMatchObject({
      category: 'disabled',
      chainable: true,
      firstByteMs: null,
      ok: false,
      provider,
    })
    expect(reads).not.toContain(credentialName)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('keeps DeepSeek enabled and first-class without an enable flag', async () => {
    const environment = {
      CHAT_ENABLE_DEEPSEEK: 'false',
      DEEPSEEK_API_KEY: 'deepseek-test-key',
    }
    const { adapters, fetchMock } = createAdapterHarness(environment)

    const result = await invoke(adapters.callDeepSeek)

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it.each([
    [401, 'auth', true],
    [403, 'safety', false],
    [400, 'invalid', false],
    [422, 'invalid', false],
    [429, 'rate-limit', true],
    [503, 'upstream', true],
  ] as const)('maps HTTP %s to %s with chainable=%s', async (status, category, chainable) => {
    const { adapters, fetchMock } = createAdapterHarness()
    fetchMock.mockReset().mockResolvedValue(new Response('', { status }))

    const result = await invoke(adapters.callDeepSeek)

    expect(result).toMatchObject({
      category,
      chainable,
      firstByteMs: null,
      model: 'deepseek-chat',
      ok: false,
      provider: 'deepseek',
    })
  })

  it('cancels an unread non-success response body without inspecting it', async () => {
    const cancel = vi.fn()
    const body = new ReadableStream<Uint8Array>({ cancel })
    const { adapters, fetchMock } = createAdapterHarness()
    fetchMock.mockReset().mockResolvedValue(new Response(body, { status: 503 }))

    await expect(invoke(adapters.callDeepSeek)).resolves.toMatchObject({
      category: 'upstream',
      ok: false,
    })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('cancels an unread response body when cancellation arrives with the headers', async () => {
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    const execution = createExecution(clientController, deadlineController)
    const cancel = vi.fn()
    const body = new ReadableStream<Uint8Array>({ cancel })
    const { adapters, fetchMock } = createAdapterHarness()
    fetchMock.mockReset().mockImplementation(async () => {
      clientController.abort()
      return new Response(body, { status: 200 })
    })

    await expect(invoke(adapters.callDeepSeek, execution)).resolves.toMatchObject({
      category: 'cancelled',
      ok: false,
    })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('distinguishes client cancellation and does not mark it chainable', async () => {
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    const execution = createExecution(clientController, deadlineController)
    const { adapters, fetchMock } = createAdapterHarness()
    fetchMock.mockReset().mockImplementation(async () => {
      clientController.abort()
      throw new DOMException('Aborted', 'AbortError')
    })

    await expect(invoke(adapters.callDeepSeek, execution)).resolves.toMatchObject({
      category: 'cancelled',
      chainable: false,
      ok: false,
    })
  })

  it('distinguishes the shared deadline and does not mark it chainable', async () => {
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    const execution = createExecution(clientController, deadlineController)
    const { adapters, fetchMock } = createAdapterHarness()
    fetchMock.mockReset().mockImplementation(async () => {
      deadlineController.abort()
      throw new DOMException('Aborted', 'AbortError')
    })

    await expect(invoke(adapters.callDeepSeek, execution)).resolves.toMatchObject({
      category: 'timeout',
      chainable: false,
      ok: false,
    })
  })

  it.each([
    ['cancelled', 'client'],
    ['timeout', 'deadline'],
  ] as const)('prioritizes an already-%s execution over missing credentials and disabled flags', async (category, abortedSignal) => {
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    if (abortedSignal === 'client') clientController.abort()
    else deadlineController.abort()

    const execution = createExecution(clientController, deadlineController)
    const environment: ChatProviderEnvironment = {}
    const fetchMock = vi.fn()
    const adapters = createChatProviderAdapters(createChatProviderConfig(environment), {
      environment,
      fetch: fetchMock as typeof fetch,
    })

    for (const adapter of [
      adapters.callDeepSeek,
      adapters.callGemini,
      adapters.callOpenRouter,
      adapters.callGroq,
    ]) {
      await expect(invoke(adapter, execution)).resolves.toMatchObject({
        category,
        chainable: false,
        ok: false,
      })
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('passes the one shared execution signal to every enabled adapter', async () => {
    const execution = createExecution()
    const { adapters, fetchMock } = createAdapterHarness()

    await invoke(adapters.callDeepSeek, execution)
    await invoke(adapters.callGemini, execution)
    await invoke(adapters.callOpenRouter, execution)
    await invoke(adapters.callGroq, execution)

    expect(fetchMock).toHaveBeenCalledTimes(4)
    for (const [, requestInit] of fetchMock.mock.calls as Array<[string, RequestInit]>) {
      expect(requestInit.signal).toBe(execution.signal)
    }
  })

  it('returns sanitized upstream metadata without logging a thrown error', async () => {
    const secretError = new Error('Bearer secret-key and visitor payload')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { adapters, fetchMock } = createAdapterHarness()
    fetchMock.mockReset().mockRejectedValue(secretError)

    const result = await invoke(adapters.callDeepSeek)

    expect(result).toMatchObject({
      category: 'upstream',
      chainable: true,
      firstByteMs: null,
      model: 'deepseek-chat',
      ok: false,
      provider: 'deepseek',
    })
    expect(JSON.stringify(result)).not.toContain('secret-key')
    expect(consoleError).not.toHaveBeenCalled()
    expect(consoleWarn).not.toHaveBeenCalled()
  })
})
