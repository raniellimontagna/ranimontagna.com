import { formatNow } from '../local-time'

describe('formatNow', () => {
  it.each([
    ['2026-10-11T14:05:00Z', '11:05'],
    ['2026-01-15T02:59:00Z', '23:59'],
    ['2026-07-01T03:00:00Z', '00:00'],
  ])('formats %s as São Paulo time %s', (iso, expected) => {
    const now = new Date(iso)

    expect(formatNow(now)).toBe(expected)
    expect(
      new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      }).format(now),
    ).toBe(expected)
  })
})
