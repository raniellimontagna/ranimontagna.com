import { CHAT_PROMPT_CANARY } from '../chat.prompt'
import { CHAT_MAX_ANSWER_CHARS, validateChatAnswer } from '../chat.response'
import { createValidationInput } from './chat.response.fixtures'

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

describe('deterministic response validation', () => {
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

  it('does not let one literal URL authorize an additional Unicode lookalike', () => {
    expect(
      validateChatAnswer(
        createValidationInput('https://ranimontagna.com ｈｔｔｐｓ://ranimontagna.com'),
      ),
    ).toEqual({ ok: false, code: 'unsafe-link' })
  })

  it('does not let a Markdown destination authorize a separate Unicode lookalike', () => {
    expect(
      validateChatAnswer(
        createValidationInput('[Site](https://ranimontagna.com) ｈｔｔｐｓ://ranimontagna.com'),
      ),
    ).toEqual({ ok: false, code: 'unsafe-link' })
  })

  it.each([
    'https://ranimontagna.com https://ranimontagna.com',
    '[Site](https://ranimontagna.com) https://ranimontagna.com',
    '[https://ranimontagna.com](https://ranimontagna.com)',
  ])('preserves legitimate literal URL multiplicity: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
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
})
