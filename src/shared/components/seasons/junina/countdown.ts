const DAY_MS = 86_400_000

export type JuninaCountdown =
  | { kind: 'days'; days: number }
  | { kind: 'sao-joao' }
  | { kind: 'arraia' }

/** Days to São João (24 June); the day itself; then the arraiá to the end of the month. */
export function juninaCountdown(now: Date): JuninaCountdown {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((Date.UTC(now.getFullYear(), 5, 24) - today) / DAY_MS)
  if (days > 0) return { kind: 'days', days }
  return days === 0 ? { kind: 'sao-joao' } : { kind: 'arraia' }
}
