import type { ProviderAttempt } from '../chat.providers'
import {
  type ChatExecutionContext,
  createChatExecutionContext,
  getChatInterruptionCategory,
} from '../chat.providers'
import {
  CHAT_MAX_ANSWER_CHARS,
  CHAT_MAX_PROVIDER_BUFFER_BYTES,
  collectProviderAnswer,
} from '../chat.response'

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

const settlesWithin = async <T>(promise: Promise<T>, milliseconds = 50) =>
  Promise.race([
    promise,
    new Promise<'blocked'>((resolve) => {
      setTimeout(() => resolve('blocked'), milliseconds)
    }),
  ])

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
