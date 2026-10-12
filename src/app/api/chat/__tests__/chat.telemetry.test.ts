import type { Event } from '@sentry/nextjs'

type FakeScopeState = {
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
    withIsolationScope: vi.fn(),
    withScope: vi.fn(),
  }
})

vi.mock('@sentry/nextjs', () => ({
  Scope: sentryMocks.FakeScope,
  captureEvent: sentryMocks.captureEvent,
  getClient: sentryMocks.getClient,
  withIsolationScope: sentryMocks.withIsolationScope,
  withScope: sentryMocks.withScope,
}))

import { type ChatTelemetryEvent, recordChatAttempt } from '../chat.telemetry'

type FakeScope = InstanceType<typeof sentryMocks.FakeScope>
type ScopeCallback = (scope: FakeScope) => unknown

const inheritedSecret = 'inherited-private-value'
const capturedEvents: Record<string, unknown>[] = []
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
    capturedEvents.length = 0
    activeIsolationScope = undefined
    activeCurrentScope = undefined

    inheritedIsolationScope.state = {
      contexts: { requestContext: inheritedSecret },
      extra: { headers: { authorization: inheritedSecret } },
      request: { headers: { cookie: inheritedSecret } },
      user: { email: inheritedSecret },
    } satisfies FakeScopeState
    inheritedCurrentScope.state = {
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
    sentryMocks.captureEvent.mockImplementation((event: Event) => {
      const isolationState = (activeIsolationScope?.state ?? {}) as FakeScopeState
      const currentState = (activeCurrentScope?.state ?? {}) as FakeScopeState
      // Sentry drops events when the current scope has no client.
      if (!activeCurrentScope?.client) return 'dropped'

      capturedEvents.push({
        ...isolationState,
        ...currentState,
        ...event,
        extra: {
          ...isolationState.extra,
          ...currentState.extra,
          ...event.extra,
        },
      })
      return 'event-id'
    })
  })

  it('captures a provider attempt with only allowlisted operational metadata', () => {
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
    expect(capturedEvents).toEqual([
      {
        extra: {
          answerLength: 120,
          durationMs: 450,
          failureCategory: null,
          fallbackActivated: false,
          finishReason: 'stop',
          firstByteMs: 175,
          traceId: 'trace-1',
          validationCode: null,
        },
        level: 'info',
        message: 'chat-provider-attempt',
        tags: {
          feature: 'chatbot',
          kind: 'provider-attempt',
          model: 'deepseek-chat',
          provider: 'deepseek',
          result: 'success',
        },
      },
    ])

    const serialized = JSON.stringify(capturedEvents)
    expect(serialized).toContain('deepseek-chat')
    expect(serialized).not.toContain(inheritedSecret)
    expect(serialized).not.toMatch(
      /authorization|api.?key|credential|systemPrompt|prompt|userMessage|visitor|answerText|rawBody|stack/i,
    )
  })

  it('captures the final safe fallback without inventing provider or model fields', () => {
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

    expect(capturedEvents).toHaveLength(1)
    expect(capturedEvents[0]).toEqual({
      extra: {
        answerLength: 168,
        durationMs: 900,
        failureCategory: 'safety',
        fallbackActivated: true,
        finishReason: null,
        firstByteMs: null,
        traceId: 'trace-2',
        validationCode: null,
      },
      level: 'warning',
      message: 'chat-safe-fallback',
      tags: {
        feature: 'chatbot',
        kind: 'safe-fallback',
        result: 'safe-fallback',
      },
    })
    expect(JSON.stringify(capturedEvents[0])).not.toMatch(/provider|model/i)
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
