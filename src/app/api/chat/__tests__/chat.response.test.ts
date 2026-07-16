import { CHAT_PROFILE_BY_LOCALE } from '../chat.profile'
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

const encodeChunks = (chunks: string[], options: { close?: boolean; cancel?: () => void } = {}) =>
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
  options?: { close?: boolean; cancel?: () => void },
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

  it('rejects an unsupported plausible year but ignores non-year four digit numbers', () => {
    expect(validateChatAnswer(createValidationInput('Comecei na área em 2024.'))).toEqual({
      ok: false,
      code: 'unsupported-year',
    })
    expect(validateChatAnswer(createValidationInput('Ajudei operações em 1234 lojas.'))).toEqual({
      ok: true,
    })
  })

  it('accepts canonical current employment dates', () => {
    expect(
      validateChatAnswer(createValidationInput('Trabalho na Lemon desde julho de 2026.')),
    ).toEqual({ ok: true })
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
