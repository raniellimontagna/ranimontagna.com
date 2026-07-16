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

  it('rejects a simple unsupported metric with a non-canonical unit', () => {
    expect(validateChatAnswer(createValidationInput('Entreguei 42 projetos relevantes.'))).toEqual({
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
    'Tenho 5+ anos em software e 10 anos de trajetória profissional.',
    'Contribuí com operações em 1.000+ lojas e para 1.000+ estoquistas.',
  ])('preserves a canonical public metric: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
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
