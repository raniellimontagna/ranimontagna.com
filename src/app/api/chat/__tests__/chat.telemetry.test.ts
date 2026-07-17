import type { Event } from '@sentry/nextjs'
import type { Mock } from 'vitest'

const sentryMocks = vi.hoisted(() => ({
  captureEvent: vi.fn(),
  withIsolationScope: vi.fn(),
  withScope: vi.fn(),
})) satisfies Record<string, Mock>

vi.mock('@sentry/nextjs', () => ({
  captureEvent: sentryMocks.captureEvent,
  withIsolationScope: sentryMocks.withIsolationScope,
  withScope: sentryMocks.withScope,
}))

import { type ChatTelemetryEvent, recordChatAttempt } from '../chat.telemetry'

type FakeScopeState = {
  contexts?: Record<string, unknown>
  extra?: Record<string, unknown>
  request?: Record<string, unknown>
  user?: Record<string, unknown>
}

const inheritedSecret = 'inherited-private-value'
const capturedEvents: Record<string, unknown>[] = []

const createFakeScope = (state: FakeScopeState) => ({
  clear: vi.fn(() => {
    for (const key of Object.keys(state)) delete state[key as keyof FakeScopeState]
  }),
})

describe('chat telemetry', () => {
  const isolationState: FakeScopeState = {}
  const currentState: FakeScopeState = {}
  const isolationScope = createFakeScope(isolationState)
  const currentScope = createFakeScope(currentState)

  beforeEach(() => {
    vi.clearAllMocks()
    capturedEvents.length = 0

    Object.assign(isolationState, {
      contexts: { requestContext: inheritedSecret },
      extra: { headers: { authorization: inheritedSecret } },
      request: { headers: { cookie: inheritedSecret } },
      user: { email: inheritedSecret },
    })
    Object.assign(currentState, {
      contexts: { activeSpanContext: inheritedSecret },
      extra: { rawBody: inheritedSecret },
      request: { data: inheritedSecret },
      user: { id: inheritedSecret },
    })

    sentryMocks.withIsolationScope.mockImplementation(
      (callback: (scope: typeof isolationScope) => unknown) => callback(isolationScope),
    )
    sentryMocks.withScope.mockImplementation((callback: (scope: typeof currentScope) => unknown) =>
      callback(currentScope),
    )
    sentryMocks.captureEvent.mockImplementation((event: Event) => {
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

    expect(isolationScope.clear).toHaveBeenCalledOnce()
    expect(currentScope.clear).toHaveBeenCalledOnce()
    expect(isolationScope.clear.mock.invocationCallOrder[0]).toBeLessThan(
      currentScope.clear.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
    )
    expect(currentScope.clear.mock.invocationCallOrder[0]).toBeLessThan(
      sentryMocks.captureEvent.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
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
