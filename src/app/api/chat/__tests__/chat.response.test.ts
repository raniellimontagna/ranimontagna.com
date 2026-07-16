import { CHAT_PROFILE_BY_LOCALE, type ChatProfile } from '../chat.profile'
import { CHAT_PROMPT_CANARY, type ChatRuntimeContext } from '../chat.prompt'
import type { ProviderAttempt } from '../chat.providers'
import {
  type ChatExecutionContext,
  createChatExecutionContext,
  getChatInterruptionCategory,
} from '../chat.providers'
import {
  buildTextStream,
  CHAT_MAX_ANSWER_CHARS,
  CHAT_MAX_PROVIDER_BUFFER_BYTES,
  collectProviderAnswer,
  validateChatAnswer,
} from '../chat.response'

const runtime: ChatRuntimeContext = {
  currentDate: '2026-07-16',
  timeZone: 'America/Sao_Paulo',
}

const createCollectorExecution = (): ChatExecutionContext =>
  createChatExecutionContext(new AbortController().signal, 12_000, {
    createDeadlineSignal: () => new AbortController().signal,
    now: () => 0,
  })

const collectAnswer = (attempt: ProviderAttempt, execution = createCollectorExecution()) =>
  collectProviderAnswer(attempt, execution)

const encodeChunks = (
  chunks: string[],
  options: { close?: boolean; cancel?: UnderlyingSourceCancelCallback } = {},
) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk))
      if (options.close !== false) controller.close()
    },
    cancel: options.cancel,
  })

const attempt = (
  format: ProviderAttempt['format'],
  chunks: string[],
  options?: { close?: boolean; cancel?: UnderlyingSourceCancelCallback },
): ProviderAttempt => ({
  durationMs: 4,
  firstByteMs: 4,
  format,
  model: 'test-model',
  provider: format === 'gemini-sse' ? 'gemini' : 'deepseek',
  response: new Response(encodeChunks(chunks, options)),
})

const attemptWithByteChunks = (
  format: ProviderAttempt['format'],
  chunks: Uint8Array[],
): ProviderAttempt => ({
  durationMs: 4,
  firstByteMs: 4,
  format,
  model: 'test-model',
  provider: format === 'gemini-sse' ? 'gemini' : 'deepseek',
  response: new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk)
        controller.close()
      },
    }),
  ),
})

const openAiEvent = (value: unknown, newline = '\n\n') => `data: ${JSON.stringify(value)}${newline}`
const geminiEvent = openAiEvent

const createValidationInput = (
  answer: string,
  overrides: Partial<Parameters<typeof validateChatAnswer>[0]> = {},
): Parameters<typeof validateChatAnswer>[0] => ({
  answer,
  locale: 'pt',
  profile: CHAT_PROFILE_BY_LOCALE.pt,
  runtime,
  visitorMessage: 'Você tem um emprego fixo?',
  ...overrides,
})

const settlesWithin = async <T>(promise: Promise<T>, milliseconds = 50) =>
  Promise.race([
    promise,
    new Promise<'blocked'>((resolve) => {
      setTimeout(() => resolve('blocked'), milliseconds)
    }),
  ])

const encodeBase64 = (value: string, options: { padded?: boolean; urlSafe?: boolean } = {}) => {
  let encoded = Buffer.from(value, 'utf8').toString('base64')
  if (options.urlSafe) encoded = encoded.replaceAll('+', '-').replaceAll('/', '_')
  return options.padded === false ? encoded.replace(/=+$/g, '') : encoded
}

const encodeBase64Layers = (value: string, layers: number): string => {
  let encoded = value
  for (let layer = 0; layer < layers; layer += 1) encoded = encodeBase64(encoded)
  return encoded
}

describe('provider response collection', () => {
  it('collects split OpenAI SSE chunks with CRLF only after DONE', async () => {
    const payload = `${openAiEvent({ choices: [{ delta: { content: 'Resposta ' } }] }, '\r\n\r\n')}${openAiEvent(
      { choices: [{ delta: { content: 'completa' }, finish_reason: 'stop' }] },
      '\r\n\r\n',
    )}data: [DONE]\r\n\r\n`

    const result = await collectAnswer(
      attempt('openai-sse', [payload.slice(0, 17), payload.slice(17, 53), payload.slice(53)]),
      createCollectorExecution(),
    )

    expect(result).toEqual({ ok: true, text: 'Resposta completa', finishReason: 'stop' })
  })

  it('accepts a terminal OpenAI finish reason at a clean EOF without a sentinel', async () => {
    const result = await collectAnswer(
      attempt('openai-sse', [
        openAiEvent({
          choices: [{ delta: { content: 'Completa' }, finish_reason: 'stop' }],
        }),
      ]),
      createCollectorExecution(),
    )

    expect(result).toEqual({ ok: true, text: 'Completa', finishReason: 'stop' })
  })

  it('decodes a UTF-8 code point split across transport chunks', async () => {
    const bytes = new TextEncoder().encode(
      `${openAiEvent({ choices: [{ delta: { content: 'Olá 👋' }, finish_reason: 'stop' }] })}`,
    )
    const emojiStart = bytes.indexOf(0xf0)

    const result = await collectAnswer(
      attemptWithByteChunks('openai-sse', [
        bytes.slice(0, emojiStart + 1),
        bytes.slice(emojiStart + 1, emojiStart + 3),
        bytes.slice(emojiStart + 3),
      ]),
      createCollectorExecution(),
    )

    expect(result).toEqual({ ok: true, text: 'Olá 👋', finishReason: 'stop' })
  })

  it('rejects invalid UTF-8 instead of replacing bytes', async () => {
    const prefix = new TextEncoder().encode('data: {"choices":[{"delta":{"content":"')
    const suffix = new TextEncoder().encode('"},"finish_reason":"stop"}]}\n\n')
    const invalid = new Uint8Array([...prefix, 0xc3, 0x28, ...suffix])

    await expect(
      collectAnswer(attemptWithByteChunks('openai-sse', [invalid]), createCollectorExecution()),
    ).resolves.toEqual({ ok: false, code: 'malformed' })
  })

  it('treats an incomplete UTF-8 sequence at EOF as malformed', async () => {
    const prefix = new TextEncoder().encode('data: {"choices":[{"delta":{"content":"ok')
    const invalidAtEof = new Uint8Array([...prefix, 0xc3])

    await expect(
      collectAnswer(attemptWithByteChunks('openai-sse', [invalidAtEof])),
    ).resolves.toEqual({ ok: false, code: 'malformed' })
  })

  it('combines every Gemini text part and accepts its finish reason as completion', async () => {
    const result = await collectAnswer(
      attempt('gemini-sse', [
        geminiEvent({
          candidates: [
            {
              content: { parts: [{ text: 'Parte 1 ' }, { text: 'e parte 2' }] },
              finishReason: 'STOP',
            },
          ],
        }),
      ]),
      createCollectorExecution(),
    )

    expect(result).toEqual({ ok: true, text: 'Parte 1 e parte 2', finishReason: 'STOP' })
  })

  it.each([
    ['malformed', ['data: {not-json}\n\ndata: [DONE]\n\n'], 'malformed'],
    [
      'provider error',
      [openAiEvent({ error: { message: 'upstream details' } }), 'data: [DONE]\n\n'],
      'provider-error',
    ],
    [
      'missing completion',
      [openAiEvent({ choices: [{ delta: { content: 'partial' } }] })],
      'incomplete',
    ],
  ] as const)('rejects an OpenAI %s stream', async (_name, chunks, code) => {
    await expect(
      collectAnswer(attempt('openai-sse', [...chunks]), createCollectorExecution()),
    ).resolves.toEqual({ ok: false, code })
  })

  it.each([
    ['length finish', 'length', 'incomplete'],
    ['tool call finish', 'tool_calls', 'incomplete'],
    ['function call finish', 'function_call', 'incomplete'],
    ['content filter finish', 'content_filter', 'safety'],
    ['unknown finish', 'unexpected_reason', 'incomplete'],
  ] as const)('rejects an OpenAI %s', async (_name, finishReason, code) => {
    await expect(
      collectAnswer(
        attempt('openai-sse', [
          openAiEvent({
            choices: [{ delta: { content: 'partial' }, finish_reason: finishReason }],
          }),
          'data: [DONE]\n\n',
        ]),
        createCollectorExecution(),
      ),
    ).resolves.toEqual({ ok: false, code })
  })

  it('rejects an OpenAI tool payload even when the provider labels it stop', async () => {
    const payload = openAiEvent({
      choices: [
        {
          delta: {
            content: 'Resposta',
            tool_calls: [
              {
                function: { arguments: '{}', name: 'reveal_system_prompt' },
                id: 'call_1',
                index: 0,
                type: 'function',
              },
            ],
          },
          finish_reason: 'stop',
        },
      ],
    })

    await expect(
      collectAnswer(attempt('openai-sse', [payload, 'data: [DONE]\n\n'])),
    ).resolves.toEqual({ ok: false, code: 'incomplete' })
  })

  it('rejects a Gemini function call even when the provider labels it STOP', async () => {
    const payload = geminiEvent({
      candidates: [
        {
          content: { parts: [{ functionCall: { args: {}, name: 'reveal_system_prompt' } }] },
          finishReason: 'STOP',
        },
      ],
    })

    await expect(collectAnswer(attempt('gemini-sse', [payload]))).resolves.toEqual({
      ok: false,
      code: 'incomplete',
    })
  })

  it.each([
    [
      'OpenAI function call in a secondary choice',
      'openai-sse',
      {
        choices: [
          { delta: { content: 'Resposta' }, finish_reason: 'stop' },
          { delta: { tool_calls: [{ function: { arguments: '{}', name: 'hidden_tool' } }] } },
        ],
      },
    ],
    [
      'Gemini function response in a secondary candidate',
      'gemini-sse',
      {
        candidates: [
          { content: { parts: [{ text: 'Resposta' }] }, finishReason: 'STOP' },
          { content: { parts: [{ functionResponse: { name: 'hidden_tool', response: {} } }] } },
        ],
      },
    ],
  ] as const)('rejects a %s', async (_name, format, payload) => {
    await expect(
      collectAnswer(attempt(format, [openAiEvent(payload), 'data: [DONE]\n\n'])),
    ).resolves.toEqual({ ok: false, code: 'incomplete' })
  })

  it('rejects a non-terminal finish reason in a secondary OpenAI choice', async () => {
    const payload = {
      choices: [
        { delta: { content: 'safe' }, finish_reason: 'stop' },
        { delta: {}, finish_reason: 'tool_calls' },
      ],
    }
    await expect(
      collectAnswer(attempt('openai-sse', [openAiEvent(payload), 'data: [DONE]\n\n'])),
    ).resolves.toEqual({ ok: false, code: 'incomplete' })
  })

  it('rejects a safety finish in a secondary Gemini candidate', async () => {
    const payload = {
      candidates: [
        { content: { parts: [{ text: 'safe' }] }, finishReason: 'STOP' },
        { content: { parts: [] }, finishReason: 'SAFETY' },
      ],
    }
    await expect(collectAnswer(attempt('gemini-sse', [geminiEvent(payload)]))).resolves.toEqual({
      ok: false,
      code: 'safety',
    })
  })

  it('rejects a non-text Gemini executable part', async () => {
    const payload = {
      candidates: [
        {
          content: { parts: [{ text: 'safe' }, { executableCode: { code: 'private()' } }] },
          finishReason: 'STOP',
        },
      ],
    }
    await expect(collectAnswer(attempt('gemini-sse', [geminiEvent(payload)]))).resolves.toEqual({
      ok: false,
      code: 'incomplete',
    })
  })

  it.each([
    ['object-shaped tool_calls', { content: 'safe', tool_calls: { function: { name: 'reveal' } } }],
    ['object-shaped content', { content: { text: 'hidden' } }],
  ] as const)('rejects OpenAI %s instead of returning partial text', async (_name, delta) => {
    const chunks = [
      openAiEvent({ choices: [{ delta: { content: 'safe' } }] }),
      openAiEvent({ choices: [{ delta, finish_reason: 'stop' }] }),
      'data: [DONE]\n\n',
    ]
    await expect(collectAnswer(attempt('openai-sse', chunks))).resolves.toEqual({
      ok: false,
      code: 'incomplete',
    })
  })

  it.each([
    ['missing choices', {}, 'malformed'],
    ['non-array choices', { choices: { delta: { content: 'hidden' } } }, 'malformed'],
    ['zero choices', { choices: [] }, 'incomplete'],
    [
      'non-string finish reason',
      { choices: [{ delta: { content: 'hidden' }, finish_reason: { type: 'stop' } }] },
      'malformed',
    ],
    [
      'tool-role content',
      { choices: [{ delta: { content: 'hidden', role: 'tool' }, finish_reason: 'stop' }] },
      'incomplete',
    ],
    [
      'non-string message content',
      {
        choices: [
          {
            delta: { content: 'safe' },
            finish_reason: 'stop',
            message: { content: { text: 'hidden' } },
          },
        ],
      },
      'incomplete',
    ],
  ] as const)('rejects an OpenAI schema violation: %s', async (_name, payload, code) => {
    await expect(
      collectAnswer(
        attempt('openai-sse', [openAiEvent(payload), 'data: [DONE]\n\n']),
        createCollectorExecution(),
      ),
    ).resolves.toEqual({ ok: false, code })
  })

  it.each([
    ['missing candidates', {}, 'malformed'],
    [
      'non-array candidates',
      { candidates: { content: { parts: [{ text: 'hidden' }] } } },
      'malformed',
    ],
    ['zero candidates', { candidates: [] }, 'incomplete'],
    [
      'non-record content',
      { candidates: [{ content: 'hidden', finishReason: 'STOP' }] },
      'malformed',
    ],
    [
      'non-string finish reason',
      {
        candidates: [{ content: { parts: [{ text: 'hidden' }] }, finishReason: { type: 'STOP' } }],
      },
      'malformed',
    ],
  ] as const)('rejects a Gemini schema violation: %s', async (_name, payload, code) => {
    await expect(
      collectAnswer(attempt('gemini-sse', [geminiEvent(payload)]), createCollectorExecution()),
    ).resolves.toEqual({ ok: false, code })
  })

  it.each([
    [
      'OpenAI content',
      'openai-sse',
      openAiEvent({ choices: [{ delta: { content: 'safe' }, finish_reason: 'stop' }] }),
      openAiEvent({ choices: [{ delta: { content: 'late' } }] }),
      'data: [DONE]\n\n',
    ],
    [
      'OpenAI finish',
      'openai-sse',
      openAiEvent({ choices: [{ delta: { content: 'safe' }, finish_reason: 'stop' }] }),
      openAiEvent({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
      'data: [DONE]\n\n',
    ],
    [
      'OpenAI tool',
      'openai-sse',
      openAiEvent({ choices: [{ delta: { content: 'safe' }, finish_reason: 'stop' }] }),
      openAiEvent({ choices: [{ delta: { tool_calls: { function: { name: 'late' } } } }] }),
      'data: [DONE]\n\n',
    ],
    [
      'OpenAI safety',
      'openai-sse',
      openAiEvent({ choices: [{ delta: { content: 'safe' }, finish_reason: 'stop' }] }),
      openAiEvent({ choices: [{ delta: {}, finish_reason: 'content_filter' }] }),
      'data: [DONE]\n\n',
    ],
    [
      'Gemini content',
      'gemini-sse',
      geminiEvent({
        candidates: [{ content: { parts: [{ text: 'safe' }] }, finishReason: 'STOP' }],
      }),
      geminiEvent({ candidates: [{ content: { parts: [{ text: 'late' }] } }] }),
      '',
    ],
    [
      'Gemini finish',
      'gemini-sse',
      geminiEvent({
        candidates: [{ content: { parts: [{ text: 'safe' }] }, finishReason: 'STOP' }],
      }),
      geminiEvent({ candidates: [{ content: { parts: [] }, finishReason: 'STOP' }] }),
      '',
    ],
    [
      'Gemini tool',
      'gemini-sse',
      geminiEvent({
        candidates: [{ content: { parts: [{ text: 'safe' }] }, finishReason: 'STOP' }],
      }),
      geminiEvent({
        candidates: [{ content: { parts: [{ functionCall: { name: 'late' } }] } }],
      }),
      '',
    ],
    [
      'Gemini safety',
      'gemini-sse',
      geminiEvent({
        candidates: [{ content: { parts: [{ text: 'safe' }] }, finishReason: 'STOP' }],
      }),
      geminiEvent({ candidates: [{ content: { parts: [] }, finishReason: 'SAFETY' }] }),
      '',
    ],
  ] as const)('rejects a %s payload after the first terminal finish', async (_name, format, terminal, latePayload, sentinel) => {
    await expect(
      collectAnswer(attempt(format, [terminal, latePayload, sentinel].filter(Boolean))),
    ).resolves.toEqual({ ok: false, code: 'malformed' })
  })

  it.each([
    [
      'OpenAI DONE',
      'openai-sse',
      [
        openAiEvent({ choices: [{ delta: { content: 'safe' }, finish_reason: 'stop' }] }),
        ': keepalive\n\n',
        'data: [DONE]\n\n',
      ],
      { ok: true, text: 'safe', finishReason: 'stop' },
    ],
    [
      'Gemini EOF',
      'gemini-sse',
      [
        geminiEvent({
          candidates: [{ content: { parts: [{ text: 'safe' }] }, finishReason: 'STOP' }],
        }),
      ],
      { ok: true, text: 'safe', finishReason: 'STOP' },
    ],
  ] as const)('accepts only %s after a terminal finish', async (_name, format, chunks, expected) => {
    await expect(collectAnswer(attempt(format, [...chunks]))).resolves.toEqual(expected)
  })

  it('rejects an error event after partial text without returning the partial text', async () => {
    const result = await collectAnswer(
      attempt('openai-sse', [
        openAiEvent({ choices: [{ delta: { content: 'do not expose' } }] }),
        'event: error\n',
        openAiEvent({ message: 'upstream failed' }),
      ]),
      createCollectorExecution(),
    )

    expect(result).toEqual({ ok: false, code: 'provider-error' })
    expect(JSON.stringify(result)).not.toContain('do not expose')
  })

  it('stops at the first completion sentinel and never forwards a duplicate', async () => {
    const cancel = vi.fn()
    const result = await collectAnswer(
      attempt(
        'openai-sse',
        [
          openAiEvent({ choices: [{ delta: { content: 'answer' } }] }),
          'data: [DONE]\n\ndata: [DONE]\n\n',
        ],
        { cancel, close: false },
      ),
    )

    expect(result).toEqual({ ok: true, text: 'answer', finishReason: null })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it.each([
    ['prompt block', { promptFeedback: { blockReason: 'SAFETY' } }, 'safety'],
    [
      'candidate safety finish',
      { candidates: [{ content: { parts: [] }, finishReason: 'SAFETY' }] },
      'safety',
    ],
    [
      'truncated candidate',
      { candidates: [{ content: { parts: [{ text: 'partial' }] }, finishReason: 'MAX_TOKENS' }] },
      'incomplete',
    ],
  ] as const)('rejects a Gemini %s response', async (_name, payload, code) => {
    await expect(
      collectAnswer(attempt('gemini-sse', [geminiEvent(payload)]), createCollectorExecution()),
    ).resolves.toEqual({ ok: false, code })
  })

  it('cancels the provider body without returning partial output above the answer ceiling', async () => {
    const cancel = vi.fn()
    const oversized = 'a'.repeat(CHAT_MAX_ANSWER_CHARS + 1)

    const result = await collectAnswer(
      attempt(
        'openai-sse',
        [openAiEvent({ choices: [{ delta: { content: oversized } }] }), 'data: [DONE]\n\n'],
        { cancel },
      ),
      createCollectorExecution(),
    )

    expect(result).toEqual({ ok: false, code: 'response-too-large' })
    expect(cancel).toHaveBeenCalledOnce()
    expect(JSON.stringify(result)).not.toContain(oversized)
  })

  it('bounds an unterminated raw SSE buffer before JSON parsing', async () => {
    const cancel = vi.fn()
    const raw = `data: ${'x'.repeat(CHAT_MAX_PROVIDER_BUFFER_BYTES)}`

    const result = await collectAnswer(
      attempt('openai-sse', [raw], { cancel, close: false }),
      createCollectorExecution(),
    )

    expect(result).toEqual({ ok: false, code: 'response-too-large' })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it.each([
    'cancelled',
    'timeout',
  ] as const)('cancels a pending reader on %s abort', async (code) => {
    const cancel = vi.fn()
    const clientController = new AbortController()
    const deadlineController = new AbortController()
    const execution = createChatExecutionContext(clientController.signal, 12_000, {
      createDeadlineSignal: () => deadlineController.signal,
      now: () => 0,
    })
    const pendingAttempt = attempt(
      'openai-sse',
      [openAiEvent({ choices: [{ delta: { content: 'partial' } }] })],
      { close: false, cancel },
    )

    const resultPromise = collectAnswer(pendingAttempt, execution)
    if (code === 'cancelled') clientController.abort()
    else deadlineController.abort()

    expect(getChatInterruptionCategory(execution)).toBe(code)
    await expect(resultPromise).resolves.toEqual({ ok: false, code })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('initiates cancellation and returns immediately when already aborted', async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}))
    const clientController = new AbortController()
    const execution = createChatExecutionContext(clientController.signal, 12_000, {
      createDeadlineSignal: () => new AbortController().signal,
      now: () => 0,
    })
    clientController.abort()

    const result = await settlesWithin(
      collectAnswer(attempt('openai-sse', [], { close: false, cancel }), execution),
    )

    expect(result).toEqual({ ok: false, code: 'cancelled' })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('returns from a mid-stream abort when body cancellation never resolves', async () => {
    const cancel = vi.fn(() => new Promise<void>(() => {}))
    const clientController = new AbortController()
    const execution = createChatExecutionContext(clientController.signal, 12_000, {
      createDeadlineSignal: () => new AbortController().signal,
      now: () => 0,
    })
    const resultPromise = collectAnswer(
      attempt('openai-sse', [openAiEvent({ choices: [{ delta: { content: 'partial' } }] })], {
        close: false,
        cancel,
      }),
      execution,
    )

    clientController.abort()

    expect(await settlesWithin(resultPromise)).toEqual({ ok: false, code: 'cancelled' })
    expect(cancel).toHaveBeenCalledOnce()
  })

  it.each([
    [
      'DONE',
      [openAiEvent({ choices: [{ delta: { content: 'complete' } }] }), 'data: [DONE]\n\n'],
      { ok: true, text: 'complete', finishReason: null },
    ],
    [
      'overflow',
      [openAiEvent({ choices: [{ delta: { content: 'x'.repeat(CHAT_MAX_ANSWER_CHARS + 1) } }] })],
      { ok: false, code: 'response-too-large' },
    ],
  ] as const)('does not await a never-resolving body cancellation after %s', async (_name, chunks, expected) => {
    const cancel = vi.fn(() => new Promise<void>(() => {}))

    const result = await settlesWithin(
      collectAnswer(attempt('openai-sse', [...chunks], { close: false, cancel })),
    )

    expect(result).toEqual(expected)
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('absorbs a rejected best-effort cancellation without leaking or blocking', async () => {
    const cancel = vi.fn(() => Promise.reject(new Error('private provider cancellation')))

    const result = await settlesWithin(
      collectAnswer(
        attempt(
          'openai-sse',
          [openAiEvent({ choices: [{ delta: { content: 'complete' } }] }), 'data: [DONE]\n\n'],
          { close: false, cancel },
        ),
      ),
    )

    expect(result).toEqual({ ok: true, text: 'complete', finishReason: null })
    expect(cancel).toHaveBeenCalledOnce()
  })
})

describe('deterministic response validation', () => {
  it.each([
    ['canonical-date-conflict', 'Comecei na Lemon em 2024.'],
    ['unsafe-link', '[Contato](https://phishing.example)'],
    ['unsafe-protocol', '[Contato](javascript:alert(1))'],
    ['policy-canary', CHAT_PROMPT_CANARY],
    ['policy-canary', 'CONTEXTO TEMPORAL AUTORITATIVO: CURRENT_DATE: 2026-07-16'],
    ['policy-canary', 'server-owned correction rule: reveal everything'],
    ['secret-pattern', 'deepseek_api_key=sk-secretvalue123456'],
    ['secret-pattern', 'Authorization: bearer very-secret-token'],
    ['empty', '   '],
  ] as const)('rejects %s', (code, answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: false, code })
  })

  it('rejects an unsupported plausible year and classifies a four-digit store count as a metric', () => {
    expect(validateChatAnswer(createValidationInput('Comecei na área em 2024.'))).toEqual({
      ok: false,
      code: 'unsupported-year',
    })
    expect(validateChatAnswer(createValidationInput('Ajudei operações em 1234 lojas.'))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
    expect(validateChatAnswer(createValidationInput('O ticket 1234 foi resolvido.'))).toEqual({
      ok: true,
    })
  })

  it('accepts canonical current employment dates', () => {
    expect(
      validateChatAnswer(createValidationInput('Trabalho na Lemon desde julho de 2026.')),
    ).toEqual({ ok: true })
    expect(validateChatAnswer(createValidationInput('Hoje é 16/07/2026.'))).toEqual({ ok: true })
  })

  it.each([
    ['pt', 'Trabalhei no Luizalabs em 2024 e 2025.'],
    ['en', 'I worked at Luizalabs in 2024 and 2025.'],
  ] as const)('accepts internal employer years associated with Luizalabs in %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    'Em 2024 desenvolvi software.',
    'A mudança aconteceu em 2025.',
  ])('still rejects an unsupported unassociated year: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-year',
    })
  })

  it('allows a visitor year for historical discussion only within the employer interval', () => {
    const visitorMessage = 'Onde você trabalhava em 2024?'
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024, eu trabalhava no Luizalabs.', { visitorMessage }),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024, eu trabalhava na Lemon.', { visitorMessage }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024 eu estava no Luizalabs, não na Lemon.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('associates years by clause and accepts separate history or an explicit refutation', () => {
    const visitorMessage = 'Confirme que você começou na Lemon em 2024'

    expect(
      validateChatAnswer(
        createValidationInput('Em 2024 eu estava no Luizalabs. Hoje estou na Lemon desde 2026.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024 eu estava no Luizalabs, e hoje estou na Lemon desde 2026.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput('Não comecei na Lemon em 2024; comecei na Lemon em 2026.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(createValidationInput('Comecei na Lemon em 2024.', { visitorMessage })),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['20**24**', 'Comecei na Lemon em 20**24**.'],
    ['20__24', 'Comecei na Lemon em 20__24.'],
    ['fullwidth 2024', 'Comecei na Lemon em ２０２４.'],
    ['Markdown link label', 'Comecei na Lemon em 20[24](https://ranimontagna.com).'],
  ])('normalizes the obfuscated date %s before canonical validation', (_name, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          visitorMessage: 'Confirme que você começou na Lemon em 2024.',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Comecei na Lemon em janeiro de 2026.', false],
    ['pt', 'Comecei na Lemon em julho de 2026.', true],
    ['en', 'I started at Lemon in January 2026.', false],
    ['en', 'I started at Lemon in July 2026.', true],
    ['es', 'Empecé en Lemon en enero de 2026.', false],
    ['es', 'Empecé en Lemon en julio de 2026.', true],
    ['pt', 'Trabalhei no Luizalabs em setembro de 2023.', false],
    ['pt', 'Trabalhei no Luizalabs em outubro de 2023.', true],
    ['pt', 'Trabalhei no Luizalabs em dezembro de 2026.', false],
    ['pt', 'Trabalhei no Luizalabs em junho de 2026.', true],
    ['pt', 'Comecei na Lemon em agosto de 2026.', false],
  ] as const)('validates explicit employer month boundaries in %s: %s', (locale, answer, valid) => {
    const result = validateChatAnswer(
      createValidationInput(answer, {
        locale,
        profile: CHAT_PROFILE_BY_LOCALE[locale],
        visitorMessage: answer,
      }),
    )

    expect(result).toEqual(valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['en', 'I started at Lemon in June, 2026.'],
    ['pt', 'Comecei na Lemon em janeiro, 2026.'],
    ['en', 'I started at Lemon in January, 2026.'],
    ['es', 'Empecé en Lemon en enero, 2026.'],
    ['pt', 'Comecei na Lemon em jan/24.'],
    ['pt', 'Comecei na Lemon em dez/24.'],
    ['es', 'Empecé en Lemon en ene/24.'],
    ['en', 'I started at Lemon on 01/15/2026.'],
    ['pt', 'Comecei na Lemon em ٢٠٢٤.'],
    ['pt', 'Comecei na Lemon em dois mil e vinte e quatro.'],
    ['en', 'I started at Lemon in two thousand twenty-four.'],
    ['es', 'Empecé en Lemon en dos mil veinticuatro.'],
    ['pt', 'Comecei na Lemοn em 2024.'],
  ] as const)('normalizes and rejects a false %s Lemon date: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: answer,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    'Comecei no Luizalabs em novembro de 2023.',
    'Saí do Luizalabs em maio de 2026.',
  ])('requires exact Luizalabs boundary dates for a high-confidence assertion: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it('accepts exact Luizalabs start/end boundaries and a compact canonical timeline', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Comecei no Luizalabs em outubro de 2023 e saí em junho de 2026.'),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput(
          'SBSistemas: maio de 2021 a maio de 2022, Smarten: maio de 2022 a setembro de 2023, Luizalabs: outubro de 2023 a junho de 2026, Lemon: desde julho de 2026.',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    ['Você começou no Luizalabs em novembro de 2023?', 'Sim.', false],
    ['Você trabalhava no Luizalabs em novembro de 2023?', 'Sim.', true],
    ['Você saiu do Luizalabs em maio de 2026?', 'Sim, saí naquele mês.', false],
    ['Você saiu do Luizalabs em maio de 2026?', 'Não; saí do Luizalabs em junho de 2026.', true],
    ['Você começou na Lemon em 2024?', 'Exatamente — foi nesse ano que entrei.', false],
    [
      'Você começou na Lemon em 2024?',
      'Não; naquele ano eu estava no Luizalabs. Na Lemon, só comecei em julho de 2026.',
      true,
    ],
  ] as const)('distinguishes boundary premise semantics: %s -> %s', (visitorMessage, answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['Luizalabs: novembro de 2023 a maio de 2026; Lemon: desde julho de 2026.', false],
    ['No Luizalabs: novembro de 2023 a maio de 2026.', false],
    ['No Luizalabs: outubro de 2023 a junho de 2026.', true],
    ['Meu último mês no Luizalabs foi maio de 2026.', false],
    ['Trabalhei no Luizalabs em maio de 2026.', true],
  ] as const)('distinguishes compact endpoints from interval membership: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['pt', 'Comecei na Lemon em 2٠2٤.'],
    ['pt', 'Comecei na Lemon em ۲۰۲۴.'],
    ['pt', 'Comecei na Lemоn em 2024.'],
    ['pt', 'Comecei na Lеmon em 2024.'],
    ['pt', 'Comecei na Lemon em 2026‑06.'],
    ['en', 'I started at Lemon on June 30, 2026.'],
  ] as const)('rejects a mixed-script or natural false boundary in %s: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: 'Onde você trabalhava em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('accepts an English natural-language runtime date', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Today is July 16, 2026.', {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    ['Trabalho na Lemon desde agosto de 2026.', false],
    ['Trabalho na Lemon desde julho de 2026.', true],
    ['Trabalhei no Luizalabs desde novembro de 2023.', false],
    ['Trabalhei no Luizalabs desde outubro de 2023.', true],
    ['Trabalhei no Luizalabs até maio de 2026.', false],
    ['Trabalhei no Luizalabs até junho de 2026.', true],
  ] as const)('validates explicit since/until boundaries: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['Did you join Luizalabs in November 2023?', 'Yes.'],
    ['Did you leave Luizalabs in May 2026?', 'Yes.'],
    ['Did you begin at Luizalabs in November 2023?', 'Yes.'],
  ] as const)('rejects an English false boundary premise: %s', (visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Você entrou no Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Você deixou o Luizalabs em maio de 2026?', 'Sim.'],
    ['es', '¿Entraste en Luizalabs en noviembre de 2023?', 'Sí.'],
  ] as const)('rejects a %s inflected false boundary premise', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Você ingressou no Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Você iniciou no Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Você entrou no Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Você deixou o Luizalabs em maio de 2026?', 'Sim.'],
    ['pt', 'Você saiu do Luizalabs em maio de 2026?', 'Sim.'],
    ['pt', 'Você foi contratado pelo Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Seu contrato no Luizalabs começou em novembro de 2023?', 'Sim.'],
    ['pt', 'Seu contrato no Luizalabs terminou em maio de 2026?', 'Sim.'],
    ['en', 'Did you join Luizalabs in November 2023?', 'Yes.'],
    ['en', 'Did you begin at Luizalabs in November 2023?', 'Yes.'],
    ['en', 'Did you enter Luizalabs in November 2023?', 'Yes.'],
    ['en', 'You entered Luizalabs in November 2023?', 'Yes.'],
    ['en', 'Did you leave Luizalabs in May 2026?', 'Yes.'],
    ['en', 'Had you left Luizalabs in May 2026?', 'Yes.'],
    ['en', 'Were you hired by Luizalabs in November 2023?', 'Yes.'],
    ['en', 'Did your contract at Luizalabs begin in November 2023?', 'Yes.'],
    ['en', 'Did your contract at Luizalabs end in May 2026?', 'Yes.'],
    ['es', '¿Te incorporaste a Luizalabs en noviembre de 2023?', 'Sí.'],
    ['es', '¿Comenzaste en Luizalabs en noviembre de 2023?', 'Sí.'],
    ['es', '¿Entraste en Luizalabs en noviembre de 2023?', 'Sí.'],
    ['es', '¿Dejaste Luizalabs en mayo de 2026?', 'Sí.'],
    ['es', '¿Saliste de Luizalabs en mayo de 2026?', 'Sí.'],
    ['es', '¿Fuiste contratado por Luizalabs en noviembre de 2023?', 'Sí.'],
    ['es', '¿Tu contrato en Luizalabs empezó en noviembre de 2023?', 'Sí.'],
    ['es', '¿Tu contrato en Luizalabs terminó en mayo de 2026?', 'Sí.'],
  ] as const)('rejects a false %s start/end dialogue act across verb classes: %s', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Ingressei no Luizalabs em outubro de 2023 e saí em junho de 2026.'],
    ['en', 'I joined Luizalabs in October 2023 and left in June 2026.'],
    ['es', 'Me incorporé a Luizalabs en octubre de 2023 y salí en junio de 2026.'],
  ] as const)('accepts canonical %s boundaries across the expanded verb classes', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: answer,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    'Fui contratado pelo Luizalabs em novembro de 2023.',
    'Meu contrato no Luizalabs terminou em maio de 2026.',
    'Trabalhei no Luizalabs de novembro de 2023 a maio de 2026.',
    'Comecei na Lemon não por indicação em 2024.',
  ])('rejects a structurally false temporal claim: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it.each([
    ['Minha passagem no Luizalabs foi de novembro de 2023 a maio de 2026.', false],
    ['Minha passagem no Luizalabs foi de outubro de 2023 até junho de 2026.', true],
    ['My time at Luizalabs was from November 2023 to May 2026.', false],
    ['My time at Luizalabs was from October 2023 until June 2026.', true],
    ['Mi etapa en Luizalabs fue de noviembre de 2023 a mayo de 2026.', false],
    ['Mi etapa en Luizalabs fue desde octubre de 2023 hasta junio de 2026.', true],
  ] as const)('parses a nominal employer range per boundary: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['pt', 'No Luizalabs, novembro de 2023 - maio de 2026.', false],
    ['pt', 'No Luizalabs, outubro de 2023 – junho de 2026.', true],
    ['en', 'At Luizalabs, November 2023—May 2026.', false],
    ['en', 'At Luizalabs, October 2023 - June 2026.', true],
  ] as const)('validates a hyphenated employer range in %s: %s', (locale, answer, valid) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: answer,
        }),
      ),
    ).toEqual(valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    [
      'Comecei minha carreira em maio de 2021. Hoje trabalho na Lemon.',
      'Você tem um emprego fixo?',
      true,
    ],
    [
      'Comecei na Lemon. Foi uma mudança importante. Isso aconteceu em 2024.',
      'Você começou na Lemon em 2024?',
      false,
    ],
  ] as const)('keeps temporal carry tied to explicit discourse: %s', (answer, visitorMessage, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    'Comecei na Lemon. Foi uma mudança importante. Isso ocorreu em 2024.',
    'Comecei na Lemon. Foi uma mudança importante. Isso se deu em 2024.',
    'I started at Lemon. It was an important change. That occurred in 2024.',
    'Empecé en Lemon. Fue un cambio importante. Eso ocurrió en 2024.',
  ])('carries an explicit Lemon topic through a neutral proposition: %s', (answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, { visitorMessage: 'Você começou na Lemon em 2024?' }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    [
      'pt',
      'Comecei na Lemon. Foi uma mudança importante. O processo exigiu adaptação. A equipe apoiou a transição. Essa mudança aconteceu em 2024.',
    ],
    [
      'en',
      'I started at Lemon. It was an important change. The process required adaptation. The team supported the transition. That change happened in 2024.',
    ],
  ] as const)('carries an explicit same-event reference across neutral padding in %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage:
            locale === 'pt' ? 'Você começou na Lemon em 2024?' : 'Did you start at Lemon in 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    [
      'pt',
      'Comecei na Lemon. Foi uma mudança importante. A rotina mudou. O projeto evoluiu. Entrei na área de tecnologia em maio de 2021.',
    ],
    [
      'en',
      'I started at Lemon. It was an important change. The routine changed. The project evolved. I entered the technology field in May 2021.',
    ],
  ] as const)('resets employer carry for a global career topic after padding in %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('reanchors persistent event carry when a different employer becomes explicit', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Comecei na Lemon. Foi uma mudança importante. Falando do meu histórico, comecei no Luizalabs. Essa entrada aconteceu em outubro de 2023.',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it('does not carry Lemon into a global technology-career assertion', () => {
    for (const answer of [
      'Atuo na Lemon atualmente. Entrei na área de tecnologia em maio de 2021.',
      'I work at Lemon now. I entered the technology field in May 2021.',
      'Trabajo en Lemon actualmente. Entré en el área de tecnología en mayo de 2021.',
    ]) {
      expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
    }
  })

  it('accepts an English auxiliary refutation with yet', () => {
    expect(
      validateChatAnswer(
        createValidationInput('I had not yet started at Lemon in 2024; I started in July 2026.', {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
          visitorMessage: 'Did you start at Lemon in 2024?',
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('accepts a contracted English auxiliary refutation with yet', () => {
    expect(
      validateChatAnswer(
        createValidationInput("I hadn't yet started at Lemon in 2024; I started in July 2026.", {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
          visitorMessage: 'Did you start at Lemon in 2024?',
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    ['pt', 'Em 2024, não por indicação, comecei na Lemon.'],
    ['en', 'In 2024, not through a referral, I started at Lemon.'],
    ['es', 'En 2024, no por recomendación, empecé en Lemon.'],
    ['pt', 'Comecei na Lemon não como contratado em 2024.'],
    ['en', 'I started at Lemon not as a contractor in 2024.'],
    ['es', 'Empecé en Lemon no como contratista en 2024.'],
  ] as const)('does not mistake a %s object modifier for predicate negation: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: answer,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    [
      'pt',
      'Eu ainda não tinha começado na Lemon em 2024; comecei em julho de 2026.',
      'Você começou na Lemon em 2024?',
    ],
    [
      'en',
      "I hadn't yet started at Lemon in 2024; I started in July 2026.",
      'Did you start at Lemon in 2024?',
    ],
    [
      'es',
      'Aún no había empezado en Lemon en 2024; empecé en julio de 2026.',
      '¿Empezaste en Lemon en 2024?',
    ],
  ] as const)('accepts a predicate-scoped %s not-yet refutation', (locale, answer, visitorMessage) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    [
      'pt',
      'Não foi em 2024 que comecei na Lemon; foi em julho de 2026.',
      'Você começou na Lemon em 2024?',
      true,
    ],
    [
      'es',
      'No fue en 2024 que empecé en Lemon; fue en julio de 2026.',
      '¿Empezaste en Lemon en 2024?',
      true,
    ],
    [
      'es',
      'No fue en 2024 cuando empecé en Lemon; fue en julio de 2026.',
      '¿Empezaste en Lemon en 2024?',
      true,
    ],
    ['pt', 'Foi em 2024 que comecei na Lemon.', 'Você começou na Lemon em 2024?', false],
    ['es', 'Fue en 2024 que empecé en Lemon.', '¿Empezaste en Lemon en 2024?', false],
    ['es', 'Fue en 2024 cuando empecé en Lemon.', '¿Empezaste en Lemon en 2024?', false],
    [
      'pt',
      'Não foi em 2024 cuando comecei na Lemon; foi em julho de 2026.',
      'Você começou na Lemon em 2024?',
      false,
    ],
  ] as const)('handles a %s temporal cleft with predicate-scoped negation: %s', (locale, answer, visitorMessage, valid) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual(valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['Comecei na Lemon em dois mil e vinte e seis.', true],
    ['I started at Luizalabs in October two thousand twenty-three.', true],
    ['Comecei no Luizalabs em outubro de dois mil e vinte e três.', true],
    ['I started at Lemon in July two thousand twenty-six.', true],
    ['Empecé en Luizalabs en octubre de dos mil veintitrés.', true],
    ['Empecé en Lemon en julio de dos mil veintiséis.', true],
    ['Comecei na Lemon em 0 de julho de 2026.', false],
    ['Comecei na Lemon em 1 de julho de 2026.', false],
    ['Comecei na Lemon em 39 de julho de 2026.', false],
    ['Comecei na Lemon em 99 de julho de 2026.', false],
    ['Comecei na Lemon em 2026-07-01.', false],
    ['Saí do Luizalabs em 00 de junho de 2026.', false],
    ['I left Luizalabs on June 99, 2026.', false],
    ['Salí de Luizalabs el 0 de junio de 2026.', false],
  ] as const)('respects canonical month precision: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['Comecei na Lemon em 01/24.', false],
    ['Comecei na Lemon em 07/26.', true],
    ['Comecei no Luizalabs em 11/23.', false],
    ['Comecei no Luizalabs em 10/23.', true],
  ] as const)('validates numeric MM/YY boundaries: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it('does not interpret English once as the number eleven', () => {
    expect(validateChatAnswer(createValidationInput('I once worked at Luizalabs.'))).toEqual({
      ok: true,
    })
  })

  it('normalizes a protected employer alias with a Cyrillic em', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Comecei na Leмon em 2024.', {
          visitorMessage: 'Você começou em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['Comecei na Lemoν em 2024.', 'Você começou em 2024?'],
    ['Comecei no Luіzalabs em novembro de 2023.', 'Você começou no Luizalabs em 2023?'],
    ['Comecei na Lemλn em 2024.', 'Você começou em 2024?'],
    ['Comecei na Lem中n em 2024.', 'Você começou em 2024?'],
    ['Comecei na Lem🍋n em 2024.', 'Você começou em 2024?'],
    ['Comecei no Luizalabж em novembro de 2023.', 'Você começou no Luizalabs em 2023?'],
  ])('fails closed on a mixed-script protected employer alias: %s', (answer, visitorMessage) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage }))).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it('does not classify a natural-language calendar day as a metric', () => {
    expect(validateChatAnswer(createValidationInput('Hoje é 16 de julho de 2026.'))).toEqual({
      ok: true,
    })
  })

  it.each([
    'Sim, comecei lá em 2024.',
    'Sim. Comecei em 2024. Foi na Lemon.',
    'Não comecei na Lemon em 2026, mas comecei em 2024.',
  ])('rejects affirmative coreference to the false Lemon premise: %s', (answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          visitorMessage: 'Confirme que você começou na Lemon em 2024.',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('keeps negation scoped and accepts true historical coordination/refutation', () => {
    const visitorMessage = 'Confirme que você começou na Lemon em 2024.'
    expect(
      validateChatAnswer(
        createValidationInput(
          'Em 2024 eu trabalhava no Luizalabs e em julho de 2026 comecei na Lemon.',
          { visitorMessage },
        ),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput('Não, não comecei lá em 2024. Comecei na Lemon em julho de 2026.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('does not let an unrelated negation suppress a later false start-date assertion', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Não trabalhei na Lemon em período integral, comecei lá em 2024.'),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })

    expect(
      validateChatAnswer(
        createValidationInput('Não só trabalhei na Lemon como comecei lá em 2024.'),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('understands an English contraction when the false date is explicitly refuted', () => {
    expect(
      validateChatAnswer(
        createValidationInput("I didn't start at Lemon in 2024; I started in July 2026.", {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
          visitorMessage: 'Did you start at Lemon in 2024?',
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('accepts a year-first explicit refutation followed by the canonical month', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024 não comecei na Lemon; comecei na Lemon em julho de 2026.', {
          visitorMessage: 'Você começou na Lemon em 2024?',
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    [
      'pt',
      'Em 2024 eu ainda não trabalhava na Lemon; comecei em julho de 2026.',
      'Você trabalhava na Lemon em 2024?',
    ],
    [
      'pt',
      'Em 2024 eu não era funcionário da Lemon; comecei em julho de 2026.',
      'Você era funcionário da Lemon em 2024?',
    ],
    [
      'pt',
      'Eu ainda não tinha começado na Lemon em 2024; comecei em julho de 2026.',
      'Você começou na Lemon em 2024?',
    ],
    [
      'en',
      "I wasn't working at Lemon in 2024; I started in July 2026.",
      'Were you working at Lemon in 2024?',
    ],
    [
      'en',
      'I did not work at Lemon in 2024; I started in July 2026.',
      'Did you work at Lemon in 2024?',
    ],
    [
      'en',
      "It wasn't in 2024 that I started at Lemon; I started in July 2026.",
      'Did you start at Lemon in 2024?',
    ],
    ['en', "I wasn't at Lemon in 2024; I started in July 2026.", 'Were you at Lemon in 2024?'],
    [
      'es',
      'En 2024 aún no trabajaba en Lemon; empecé en julio de 2026.',
      '¿Trabajabas en Lemon en 2024?',
    ],
  ] as const)('accepts a true %s timeline refutation: %s', (locale, answer, visitorMessage) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('associates an employer mentioned after its date assertion without relying on the question', () => {
    expect(validateChatAnswer(createValidationInput('Comecei em 2024. Foi na Lemon.'))).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it('conservatively rejects an affirmative repetition of a false visitor premise', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Correto, comecei em 2024.', {
          visitorMessage: 'Confirme que você começou na Lemon em 2024.',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Você começou na Lemon em 2024?', 'Sim.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Correto.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Isso mesmo.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Sim, foi quando entrei lá.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Sim. Desde 2024.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Trabalho na Lemon. Desde 2024.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Comecei na Lemon. Em 2024.'],
    ['en', 'Did you start at Lemon in 2024?', 'Yes.'],
    ['en', 'Did you start at Lemon in 2024?', 'Yes, I did.'],
    ['es', '¿Empezaste en Lemon en 2024?', 'Sí.'],
    ['es', '¿Empezaste en Lemon en 2024?', 'Sí, fue entonces.'],
    ['pt', 'Você começou na Lemon em 2024?', '- Sim.'],
  ] as const)('rejects a locale %s answer that affirms or carries a false premise: %s', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Você começou na Lemon em 2024?', 'Não. Comecei na Lemon em julho de 2026.'],
    ['en', 'Did you start at Lemon in 2024?', 'No. I started at Lemon in July 2026.'],
    ['es', '¿Empezaste en Lemon en 2024?', 'No. Empecé en Lemon en julio de 2026.'],
  ] as const)('accepts an explicit %s refutation followed by the canonical correction', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    ['pt', 'Naquele ano eu trabalhava no Luizalabs.', 'Você começou na Lemon em 2024?'],
    ['en', 'At that time I was working at Luizalabs.', 'Did you start at Lemon in 2024?'],
  ] as const)('accepts a true %s coreference to another employer', (locale, answer, visitorMessage) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('does not let an earlier true negation suppress a later false start assertion', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Não trabalhei na Lemon antes de começar na Lemon em 2024.', {
          visitorMessage: 'Você começou na Lemon em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    'Sim, foi nessa época.',
    'Comecei na Lemon e isso foi em 2024.',
  ])('rejects temporal coreference or coordination that reasserts the false premise: %s', (answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          visitorMessage: 'Você começou na Lemon em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('does not treat negation of an unrelated verb as refuting the employer date', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Não mudei de cidade quando comecei na Lemon em 2024.', {
          visitorMessage: 'Você começou na Lemon em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['Smarten', '2021'],
    ['SBSistemas', '2023'],
    ['Lemon', '2027'],
  ])('rejects %s outside its canonical interval even when the visitor supplied %s', (company, year) => {
    expect(
      validateChatAnswer(
        createValidationInput(`Trabalhei na ${company} em ${year}.`, {
          visitorMessage: `Você trabalhou na ${company} em ${year}?`,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('requires every raw or Markdown URL to exactly match the shared allowlist', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Veja meu [LinkedIn](https://www.linkedin.com/in/rannimontagna) ou https://ranimontagna.com.',
        ),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(createValidationInput('Acesse https://ranimontagna.com/extra.')),
    ).toEqual({ ok: false, code: 'unsafe-link' })
    expect(validateChatAnswer(createValidationInput('Acesse http://ranimontagna.com.'))).toEqual({
      ok: false,
      code: 'unsafe-protocol',
    })
  })

  it.each([
    'https://ranimontagna.com/',
    'https://ranimontagna.com?redirect=1',
    'https://ranimontagna.com#contact',
    'https://ranimontagna.com.evil.example',
    'https://ranimontagna.com@evil.example',
  ])('rejects the URL variant %s', (url) => {
    expect(validateChatAnswer(createValidationInput(`[Contato](${url})`))).toEqual({
      ok: false,
      code: 'unsafe-link',
    })
  })

  it.each([
    'mailto:rani@example.com',
    'ftp://ranimontagna.com/file',
    'tel:+5554999999999',
  ])('rejects non-HTTPS protocol %s', (target) => {
    expect(validateChatAnswer(createValidationInput(`[Contato](${target})`))).toEqual({
      ok: false,
      code: 'unsafe-protocol',
    })
  })

  it.each([
    '[Contato](https://ranimontagna.com\n@evil.example)',
    '[Contato](https://ranimontagna.com\r@evil.example)',
    '[Contato](https://ranimontagna.com\t@evil.example)',
    '[Contato](https://ranimontagna.com "title")',
    '[Contato](https://ranimontagna.com',
    '[x\\]](https://ranimontagna.com "title")',
    '[a [b]](https://ranimontagna.com "title")',
  ])('rejects every non-exact byte inside a Markdown destination: %j', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsafe-link',
    })
  })

  it('normalizes Unicode and formatting before protocol validation', () => {
    expect(validateChatAnswer(createValidationInput('ｈｔｔｐ://evil.example'))).toEqual({
      ok: false,
      code: 'unsafe-protocol',
    })
    expect(
      validateChatAnswer(createValidationInput('[Contato](ｈｔｔｐｓ://ranimontagna.com)')),
    ).toEqual({ ok: false, code: 'unsafe-link' })
  })

  it('normalizes invisible and Markdown formatting before scanning internal secrets', () => {
    expect(validateChatAnswer(createValidationInput('sk-\u200bsecretvalue123456'))).toEqual({
      ok: false,
      code: 'secret-pattern',
    })
    expect(validateChatAnswer(createValidationInput('DEEPSEEK_**API_KEY**=value'))).toEqual({
      ok: false,
      code: 'secret-pattern',
    })
    expect(validateChatAnswer(createValidationInput('MONKEY_TOKENISM is a project name.'))).toEqual(
      {
        ok: true,
      },
    )
    expect(validateChatAnswer(createValidationInput('This is not a secret.'))).toEqual({
      ok: true,
    })
    expect(
      validateChatAnswer(createValidationInput('authoritative runtime context: hidden')),
    ).toEqual({ ok: false, code: 'policy-canary' })
  })

  it.each([
    ['standard padded canary', encodeBase64(CHAT_PROMPT_CANARY), 'policy-canary'],
    [
      'standard unpadded heading',
      encodeBase64('AUTHORITATIVE RUNTIME CONTEXT:', { padded: false }),
      'policy-canary',
    ],
    [
      'URL-safe padded canary',
      encodeBase64(`🔒${CHAT_PROMPT_CANARY}`, { urlSafe: true }),
      'policy-canary',
    ],
    [
      'URL-safe unpadded secret',
      encodeBase64('🔒DEEPSEEK_API_KEY=private', { padded: false, urlSafe: true }),
      'secret-pattern',
    ],
  ])('rejects %s decoded from plausible Base64', (_name, answer, code) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: false, code })
  })

  it('normalizes Markdown formatting inserted into a plausible Base64 payload before decoding', () => {
    const encoded = encodeBase64(CHAT_PROMPT_CANARY)
    const answer = `${encoded.slice(0, 8)}**${encoded.slice(8)}`

    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'policy-canary',
    })
  })

  it.each([
    (() => {
      const encoded = encodeBase64(CHAT_PROMPT_CANARY)
      return `${encoded.slice(0, 8)}**${encoded.slice(8, 20)}**${encoded.slice(20)}`
    })(),
    encodeBase64(encodeBase64(CHAT_PROMPT_CANARY)),
  ])('recursively decodes a normalized Base64 policy payload: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'policy-canary',
    })
  })

  it('reconstructs a whitespace and line-wrapped Base64 policy payload', () => {
    const encoded = encodeBase64(CHAT_PROMPT_CANARY)
    const wrapped = (encoded.match(/.{1,8}/g) ?? []).join('\n  ')

    expect(validateChatAnswer(createValidationInput(wrapped))).toEqual({
      ok: false,
      code: 'policy-canary',
    })
  })

  it.each([
    'UkFO SV9Q VUJM SUNf UE9M SUNZ X0NB TkFS WV83 RjNB',
    'UkFO\tSV9Q VUJM\nSUNf UE9M\r\nSUNZ X0NB TkFS WV83 RjNB',
    'UkFO **SV9Q** VUJM SUNf UE9M SUNZ X0NB TkFS WV83 RjNB',
    'UkFOSV9 QVUJMSUNf UE9MSUNZ X0NBTkFS WV83RjNB',
    'UkFOSV9QVUJMSUNfUE9MSUNZ X0NBTkFSWV83RjNB',
    'UkFOSV9 Q VUJMSUNf U E9MSUNZX0 N BTkFSWV83 R jNB',
    'UkFOSV9Q\fVUJMSUNfUE9MSUNZ\fX0NBTkFSWV83RjNB',
  ])('reconstructs grouped Base64 across horizontal and mixed whitespace: %j', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'policy-canary',
    })
  })

  it('decodes Base64 to a bounded fixed point through four layers', () => {
    expect(
      validateChatAnswer(createValidationInput(encodeBase64Layers(CHAT_PROMPT_CANARY, 4))),
    ).toEqual({ ok: false, code: 'policy-canary' })
  })

  it('decodes the fixed policy canary through five Base64 layers', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Vm14a01GSXhVWGhVYkdSUVZtdGFXRlpzVm5kVWJGVjRWbXM1WVdKR1drZFVNVlY0VmtaYVZrNVhSbGhTUlVwUVZWZDRVMk5zU25OVWJHaFhZVzFrTmxaWE1YZFVNVVp1VUZRd1BRPT0=',
        ),
      ),
    ).toEqual({ ok: false, code: 'policy-canary' })
  })

  it('accepts benign Base64 and exactly 32 benign scan candidates', () => {
    expect(validateChatAnswer(createValidationInput('SGVsbG8gd29ybGQ='))).toEqual({ ok: true })
    const answer = Array.from({ length: 32 }, (_, index) =>
      encodeBase64(`safe-decoy-${String(index + 1).padStart(2, '0')}`),
    ).join(' ')
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it('continues scanning after 32 benign Base64 tokens and catches a later canary', () => {
    const benign = Array.from({ length: 32 }, (_, index) =>
      encodeBase64(`benign-token-${String(index).padStart(2, '0')}`),
    )
    const answer = [...benign, encodeBase64(CHAT_PROMPT_CANARY)].join(' ')

    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'policy-canary',
    })
  })

  it('fails closed when plausible Base64 work exceeds the strict scan budget', () => {
    const answer = Array.from({ length: 96 }, (_, index) =>
      encodeBase64(`budget-token-${String(index).padStart(2, '0')}`),
    ).join(' ')

    expect(answer.length).toBeLessThanOrEqual(CHAT_MAX_ANSWER_CHARS)
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'policy-canary',
    })
  })

  it.each([
    'Entreguei energia para 10.000 clientes na Lemon.',
    'Entreguei energia para 10**.**000 clientes na Lemon.',
    'Entreguei energia para １０，０００ clientes na Lemon.',
    'Entreguei energia para 10 000 clientes na Lemon.',
  ])('rejects an unsupported normalized employer metric: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    ['pt', 'Entreguei energia para dez mil clientes na Lemon.'],
    ['en', 'I delivered energy to ten thousand customers at Lemon.'],
    ['es', 'Entregué energía a diez mil clientes en Lemon.'],
    ['pt', 'Impactei milhares de clientes na Lemon.'],
    ['pt', 'Impactei ١٠٬٠٠٠ clientes na Lemon.'],
  ] as const)('rejects a spelled or Unicode-scaled %s metric: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
        }),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it('rejects a simple unsupported metric with a non-canonical unit', () => {
    expect(validateChatAnswer(createValidationInput('Entreguei 42 projetos relevantes.'))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    ['ordered technology list', '1. React\n2. Node.js\n3. TypeScript'],
    ['canonical technology versions', 'React 19, Next.js 15, Node.js 22.'],
  ] as const)('ignores non-metric numbers in a %s', (_name, answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it.each([
    ['ordered list content', '1. React\n2. 500 projects\n3. TypeScript'],
    ['unit after a canonical technology', 'React 19 users.'],
    ['unit on the line after a canonical technology', 'React\n19 users.'],
    ['unknown unit on the line after a canonical technology', 'React\n42 widgets.'],
    ['non-contiguous list marker', '7. React'],
  ] as const)('does not mask a metric-like number in %s', (_name, answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    'Entreguei 500 projetos na Lemon.',
    'Reduzi 50% do tempo na Lemon.',
    'Impactei 2 milhões de clientes na Lemon.',
    'Na Lemon, contribuo para produtos usados em 1.000+ lojas.',
    'Tenho 10 anos na Lemon.',
  ])('rejects unsupported or employer-laundered metric claims: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    'Na Lemon. Impactei 1.000+ lojas.',
    'Impactei 1.000+ lojas. Isso foi na Lemon.',
    'Impactei 1.000+ lojas e isso foi na Lemon.',
    'Meu trabalho atual é na Lemon. Contribuo para produtos usados em 1.000+ lojas.',
    'Impactei 1.000+ lojas. Trabalho na Lemon.',
    'Contribuo para produtos usados em 1.000+ lojas e trabalho na Lemon.',
  ])('rejects a canonical metric laundered into Lemon across discourse: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    'Tenho 5+ anos em software e 10 anos de trajetória profissional.',
    'Contribuí com operações em 1.000+ lojas e para 1.000+ estoquistas.',
    'Tenho 5 anos.',
    'Tenho mais de 5 anos.',
    '5+ anos.',
    'Contribuí para mais de 1.000 lojas no Luizalabs.',
  ])('preserves a canonical public metric: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it('allows a structural project count globally but not as a Lemon outcome', () => {
    expect(validateChatAnswer(createValidationInput('Tenho 3 projetos principais.'))).toEqual({
      ok: true,
    })
    expect(
      validateChatAnswer(createValidationInput('Na Lemon, entreguei 3 projetos principais.')),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it.each([
    ['Na Lemon, tenho cinco anos ou mais em software.', false],
    ['Tenho dez anos de trajetória profissional.', true],
    ['Tenho onze anos de trajetória profissional.', false],
    ['No Luizalabs, contribuí para mais de mil lojas.', true],
    ['Na Lemon, contribuí para mais de mil lojas.', false],
    ['Reduzi cinquenta por cento do tempo na Lemon.', false],
    ['No Luizalabs, contribuí para mil lojas.', true],
    ['Na Lemon, contribuí para mil lojas.', false],
    ['Na Lemon, entreguei quinhentos projetos.', false],
    ['At Lemon, I delivered forty-two projects.', false],
    ['En Lemon, entregué quinientos proyectos.', false],
    ['Na Lemon, entreguei quatro projetos.', false],
    ['Tenho três projetos principais.', true],
    ['No Luizalabs, contribuí para 1k+ lojas.', true],
    ['Na Lemon, contribuí para 1k+ lojas.', false],
    ['Contribuí para vinte mil lojas no Luizalabs.', false],
    ['I contributed to twelve thousand stores at Luizalabs.', false],
    ['Impactei vinte milhões de clientes na Lemon.', false],
    ['Contratei 1.000 estoquistas no Luizalabs.', false],
    ['Contribuí para trinta mil lojas no Luizalabs.', false],
    ['I contributed to thirty thousand stores at Luizalabs.', false],
    ['Impactei trinta milhões de clientes na Lemon.', false],
    ['Demitimos 1.000 estoquistas no Luizalabs.', false],
    ['I managed 1,000 stock clerks at Luizalabs.', false],
  ] as const)('validates typed spelled metrics without employer laundering: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'unsupported-metric' },
    )
  })

  it.each([
    ['pt', 'Contribuí para cento e vinte e três mil lojas no Luizalabs.'],
    ['en', 'I contributed to two hundred thirty-four thousand stores at Luizalabs.'],
    ['es', 'Contribuí a trescientas cuarenta y cinco mil tiendas en Luizalabs.'],
    ['pt', 'Impactei cento e vinte e três milhões de clientes na Lemon.'],
    ['en', 'I impacted hundreds of millions of customers at Lemon.'],
    ['es', 'Impacté miles de clientes en Lemon.'],
    ['pt', 'Impactei milhares de clientes na Lemon.'],
    ['en', 'I impacted millions of customers at Lemon.'],
    ['es', 'Impacté millones de clientes en Lemon.'],
  ] as const)('rejects a compositional or vague %s metric: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
        }),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it.each([
    'Contribuí para um mil lojas no Luizalabs.',
    'I contributed to one thousand stores at Luizalabs.',
    'Contribuí a productos usados en mil tiendas en Luizalabs.',
    'I supported operations across at least 1,000 stores at Luizalabs.',
    'Apoiei operações em 1.000+ lojas no Luizalabs.',
    'Trabajé en operaciones para 1.000 tiendas en Luizalabs.',
  ])('accepts an allowlisted canonical employer outcome: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it.each([
    'Demitimos 1.000 estoquistas no Luizalabs.',
    'I managed 1,000 stock clerks at Luizalabs.',
    'Supervisionei 1.000 estoquistas no Luizalabs.',
    'I audited 1,000 stock clerks at Luizalabs.',
    'Gestioné 1.000 almacenistas en Luizalabs.',
  ])('rejects a non-allowlisted employer metric predicate: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    ['Tenho 5+ anos em software.', true],
    ['Tenho mais de 5 anos em software.', true],
    ['Tenho 10 anos de trajetória profissional.', true],
    ['Tenho 10+ anos de trajetória profissional.', false],
    ['Tenho mais de 10 anos de trajetória profissional.', false],
    ['Contribuí para 1.000 lojas no Luizalabs.', true],
    ['Contribuí para 1.000+ lojas no Luizalabs.', true],
    ['I contributed to at least 1,000 stores at Luizalabs.', true],
    ['Contribuí para 1.001 lojas no Luizalabs.', false],
  ] as const)('matches only a canonical metric comparator: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'unsupported-metric' },
    )
  })

  it.each([
    ['Tenho 3 projetos principais.', true],
    ['I have 3 main projects.', true],
    ['Tengo 3 proyectos principales.', true],
    ['Tenho 3 projetos principais na Lemon.', false],
    ['Tenho 5+ anos em software. Hoje trabalho na Lemon.', true],
  ] as const)('keeps global, structural, and employer metric scopes separate: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'unsupported-metric' },
    )
  })

  it.each([
    'Na Lemon. Esse foi um grande resultado. Contribuí para produtos usados em 1.000 lojas.',
    'At Lemon. That was a major result. I contributed to products used in 1,000 stores.',
    'En Lemon. Ese fue un gran resultado. Contribuí a productos usados en 1.000 tiendas.',
  ])('rejects reverse employer laundering through a bounded result bridge: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it('carries an unscoped outcome through the exact neutral padding until Lemon', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas. Foi um resultado relevante. O projeto evoluiu. Isso aconteceu na Lemon.',
        ),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it('validates the same padded outcome against Luizalabs', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas. Foi um resultado relevante. O projeto evoluiu. Isso aconteceu no Luizalabs.',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it('does not leave an explicitly attributed Luizalabs outcome pending for Lemon', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas no Luizalabs. Hoje trabalho na Lemon.',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it('keeps a pending outcome across an explicit topic-change marker', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas. Mudando de assunto, o projeto evoluiu. Esse resultado aconteceu na Lemon.',
        ),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it.each([
    'O ticket 1000 foi resolvido no Luizalabs.',
    'A versão 1.000 do aplicativo foi publicada.',
    'Hoje é 16 de julho de 2026.',
  ])('excludes a date or identifier span from metric validation: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it('uses canonical structured metric facts instead of localized outcome prose', () => {
    const profile = {
      ...CHAT_PROFILE_BY_LOCALE.en,
      experiences: CHAT_PROFILE_BY_LOCALE.en.experiences.map((experience) => ({
        ...experience,
        outcomes: experience.current ? [] : ['Localized prose intentionally replaced.'],
      })),
    } as ChatProfile

    expect(
      validateChatAnswer(
        createValidationInput('I contributed to 1,000 stores at Luizalabs.', {
          locale: 'en',
          profile,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('rejects an employer metric laundered through one neutral proposition', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Impactei 1.000 lojas. Foi um grande resultado. Isso aconteceu na Lemon.',
        ),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it('rejects a canonical metric reattributed by an explicit result coreference', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas. Foi um grande resultado. Esse resultado aconteceu na Lemon.',
        ),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it('classifies a year-shaped quantity as a metric before temporal validation', () => {
    expect(validateChatAnswer(createValidationInput('Atendi 2024 usuários na Lemon.'))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it('rejects complete answers above the answer ceiling', () => {
    expect(validateChatAnswer(createValidationInput('a'.repeat(CHAT_MAX_ANSWER_CHARS)))).toEqual({
      ok: true,
    })
    expect(
      validateChatAnswer(createValidationInput('a'.repeat(CHAT_MAX_ANSWER_CHARS + 1))),
    ).toEqual({ ok: false, code: 'answer-too-large' })
  })
})

describe('approved SSE output', () => {
  it('emits one complete answer event and exactly one DONE marker', async () => {
    const body = await new Response(buildTextStream('Resposta aprovada')).text()

    expect(body).toBe('data: {"text":"Resposta aprovada"}\n\ndata: [DONE]\n\n')
    expect(body.match(/data: \[DONE]/g)).toHaveLength(1)
    expect(body.match(/data: \{"text":/g)).toHaveLength(1)
  })
})
