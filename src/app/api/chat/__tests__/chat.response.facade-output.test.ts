import { CHAT_PROMPT_CANARY } from '../chat.prompt'
import { buildTextStream, CHAT_MAX_ANSWER_CHARS, validateChatAnswer } from '../chat.response'
import { createValidationInput } from './chat.response.fixtures'

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
