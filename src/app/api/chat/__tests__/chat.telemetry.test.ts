type FakeScopeState = {
  attributes?: Record<string, unknown>
  contexts?: Record<string, unknown>
  extra?: Record<string, unknown>
  request?: Record<string, unknown>
  user?: Record<string, unknown>
}

const sentryMocks = vi.hoisted(() => {
  class FakeScope {
    client: unknown = undefined
    state: Record<string, unknown> = {}
    setClient = vi.fn((client: unknown) => {
      this.client = client
    })
  }

  return {
    FakeScope,
    captureEvent: vi.fn(),
    getClient: vi.fn(),
    logger: { info: vi.fn(), warn: vi.fn() },
    withIsolationScope: vi.fn(),
    withScope: vi.fn(),
  }
})

vi.mock('@sentry/nextjs', () => ({
  Scope: sentryMocks.FakeScope,
  captureEvent: sentryMocks.captureEvent,
  getClient: sentryMocks.getClient,
  logger: sentryMocks.logger,
  withIsolationScope: sentryMocks.withIsolationScope,
  withScope: sentryMocks.withScope,
}))

import { type ChatTelemetryEvent, recordChatAttempt } from '../chat.telemetry'

type FakeScope = InstanceType<typeof sentryMocks.FakeScope>
type ScopeCallback = (scope: FakeScope) => unknown

type CapturedLog = { attributes: Record<string, unknown>; level: string; message: string }

const inheritedSecret = 'inherited-private-value'
const capturedLogs: CapturedLog[] = []
const sentryClient = { name: 'sentry-client' }

// Mirrors Sentry: the callback-only overload forks the active (inherited) scope,
// while passing a scope runs the callback with exactly that scope.
const runWithScope =
  (inherited: FakeScope, onActivate: (scope: FakeScope) => void) =>
  (scopeOrCallback: FakeScope | ScopeCallback, maybeCallback?: ScopeCallback) => {
    const scope = typeof scopeOrCallback === 'function' ? inherited : scopeOrCallback
    const callback = typeof scopeOrCallback === 'function' ? scopeOrCallback : maybeCallback
    onActivate(scope)
    return callback?.(scope)
  }

describe('chat telemetry', () => {
  const inheritedIsolationScope = new sentryMocks.FakeScope()
  const inheritedCurrentScope = new sentryMocks.FakeScope()
  let activeIsolationScope: FakeScope | undefined
  let activeCurrentScope: FakeScope | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    capturedLogs.length = 0
    activeIsolationScope = undefined
    activeCurrentScope = undefined

    inheritedIsolationScope.state = {
      attributes: { requestPath: inheritedSecret },
      contexts: { requestContext: inheritedSecret },
      extra: { headers: { authorization: inheritedSecret } },
      request: { headers: { cookie: inheritedSecret } },
      user: { email: inheritedSecret },
    } satisfies FakeScopeState
    inheritedCurrentScope.state = {
      attributes: { requestBody: inheritedSecret },
      contexts: { activeSpanContext: inheritedSecret },
      extra: { rawBody: inheritedSecret },
      request: { data: inheritedSecret },
      user: { id: inheritedSecret },
    } satisfies FakeScopeState
    inheritedCurrentScope.client = sentryClient

    sentryMocks.getClient.mockReturnValue(sentryClient)
    sentryMocks.withIsolationScope.mockImplementation(
      runWithScope(inheritedIsolationScope, (scope) => {
        activeIsolationScope = scope
      }),
    )
    sentryMocks.withScope.mockImplementation(
      runWithScope(inheritedCurrentScope, (scope) => {
        activeCurrentScope = scope
      }),
    )
    // Mirrors Sentry's log capture: scope attributes and the scope user are merged
    // into the log attributes, and a log without a client on the scope is dropped.
    const captureLog =
      (level: string) => (message: string, attributes?: Record<string, unknown>) => {
        if (!activeCurrentScope?.client) return

        const isolationState = (activeIsolationScope?.state ?? {}) as FakeScopeState
        const currentState = (activeCurrentScope.state ?? {}) as FakeScopeState
        const user = { ...isolationState.user, ...currentState.user }
        capturedLogs.push({
          attributes: {
            ...isolationState.attributes,
            ...currentState.attributes,
            ...(user.id ? { 'user.id': user.id } : {}),
            ...(user.email ? { 'user.email': user.email } : {}),
            ...attributes,
          },
          level,
          message,
        })
      }
    sentryMocks.logger.info.mockImplementation(captureLog('info'))
    sentryMocks.logger.warn.mockImplementation(captureLog('warn'))
  })

  it('logs a successful provider attempt at info with only allowlisted operational metadata', () => {
    recordChatAttempt({
      answerLength: 120,
      durationMs: 450,
      failureCategory: null,
      fallbackActivated: false,
      finishReason: 'stop',
      firstByteMs: 175,
      kind: 'provider-attempt',
      model: 'deepseek-chat',
      provider: 'deepseek',
      result: 'success',
      traceId: 'trace-1',
      validationCode: null,
    })

    expect(activeIsolationScope).not.toBe(inheritedIsolationScope)
    expect(activeCurrentScope).not.toBe(inheritedCurrentScope)
    expect(activeCurrentScope?.setClient).toHaveBeenCalledWith(sentryClient)
    expect(sentryMocks.withIsolationScope.mock.invocationCallOrder[0]).toBeLessThan(
      sentryMocks.withScope.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    )
    expect(sentryMocks.captureEvent).not.toHaveBeenCalled()
    expect(sentryMocks.logger.warn).not.toHaveBeenCalled()
    expect(capturedLogs).toEqual([
      {
        attributes: {
          answerLength: 120,
          durationMs: 450,
          fallbackActivated: false,
          feature: 'chatbot',
          finishReason: 'stop',
          firstByteMs: 175,
          kind: 'provider-attempt',
          model: 'deepseek-chat',
          provider: 'deepseek',
          result: 'success',
          traceId: 'trace-1',
        },
        level: 'info',
        message: 'chat-provider-attempt',
      },
    ])

    const serialized = JSON.stringify(capturedLogs)
    expect(serialized).toContain('deepseek-chat')
    expect(serialized).not.toContain(inheritedSecret)
    expect(serialized).not.toMatch(
      /authorization|api.?key|credential|systemPrompt|prompt|userMessage|visitor|answerText|rawBody|stack|user\./i,
    )
  })

  it('logs a failed provider attempt at warn with flat primitive attributes', () => {
    recordChatAttempt({
      answerLength: 0,
      durationMs: 3000,
      failureCategory: 'validation',
      fallbackActivated: true,
      finishReason: 'length',
      firstByteMs: null,
      kind: 'provider-attempt',
      model: 'deepseek-chat',
      provider: 'deepseek',
      result: 'validation-failure',
      traceId: 'trace-4',
      validationCode: 'unsafe-link',
    })

    expect(sentryMocks.logger.info).not.toHaveBeenCalled()
    expect(capturedLogs).toHaveLength(1)
    expect(capturedLogs[0]).toMatchObject({
      attributes: {
        failureCategory: 'validation',
        result: 'validation-failure',
        validationCode: 'unsafe-link',
      },
      level: 'warn',
      message: 'chat-provider-attempt',
    })
    const attributes = Object.values(capturedLogs[0]?.attributes ?? {})
    expect(
      attributes.every((value) => ['string', 'number', 'boolean'].includes(typeof value)),
    ).toBe(true)
    expect(capturedLogs[0]?.attributes).not.toHaveProperty('firstByteMs')
  })

  it('logs the final safe fallback at warn without inventing provider or model fields', () => {
    recordChatAttempt({
      answerLength: 168,
      durationMs: 900,
      failureCategory: 'safety',
      fallbackActivated: true,
      finishReason: null,
      firstByteMs: null,
      kind: 'safe-fallback',
      result: 'safe-fallback',
      traceId: 'trace-2',
      validationCode: null,
    })

    expect(sentryMocks.captureEvent).not.toHaveBeenCalled()
    expect(capturedLogs).toEqual([
      {
        attributes: {
          answerLength: 168,
          durationMs: 900,
          failureCategory: 'safety',
          fallbackActivated: true,
          feature: 'chatbot',
          kind: 'safe-fallback',
          result: 'safe-fallback',
          traceId: 'trace-2',
        },
        level: 'warn',
        message: 'chat-safe-fallback',
      },
    ])
    expect(JSON.stringify(capturedLogs[0])).not.toMatch(/provider|model/i)
    expect(JSON.stringify(capturedLogs[0])).not.toContain(inheritedSecret)
  })

  it('exposes a discriminated public type with no content, request, or secret-bearing fields', () => {
    type ProviderAttemptEvent = Extract<ChatTelemetryEvent, { kind: 'provider-attempt' }>
    type SafeFallbackEvent = Extract<ChatTelemetryEvent, { kind: 'safe-fallback' }>
    type ForbiddenContentKey =
      | 'answer'
      | 'answerText'
      | 'authorization'
      | 'credentials'
      | 'error'
      | 'headers'
      | 'prompt'
      | 'providerBody'
      | 'rawBody'
      | 'stack'
      | 'systemPrompt'
      | 'userContent'
      | 'userMessage'
      | 'visitorMessage'

    expectTypeOf<Extract<keyof ProviderAttemptEvent, ForbiddenContentKey>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof SafeFallbackEvent, ForbiddenContentKey>>().toEqualTypeOf<never>()
    expectTypeOf<Extract<keyof SafeFallbackEvent, 'provider' | 'model'>>().toEqualTypeOf<never>()
    expectTypeOf<ProviderAttemptEvent['kind']>().toEqualTypeOf<'provider-attempt'>()
    expectTypeOf<SafeFallbackEvent['kind']>().toEqualTypeOf<'safe-fallback'>()
  })

  it('does not let telemetry failures change the chat execution path', () => {
    sentryMocks.withIsolationScope.mockImplementationOnce(() => {
      throw new Error(inheritedSecret)
    })

    expect(() =>
      recordChatAttempt({
        answerLength: 0,
        durationMs: 3,
        failureCategory: 'upstream',
        fallbackActivated: true,
        finishReason: null,
        firstByteMs: null,
        kind: 'provider-attempt',
        model: 'deepseek-chat',
        provider: 'deepseek',
        result: 'provider-failure',
        traceId: 'trace-3',
        validationCode: null,
      }),
    ).not.toThrow()
  })
})
