'use client'

import { useEffect, useState } from 'react'

/**
 * Horário de Brasília (America/Sao_Paulo) é UTC−3 fixo desde que o Brasil
 * acabou com o horário de verão, em 2019. A conta é feita à mão porque um
 * Intl.DateTimeFormat com fuso, ainda frio, carrega os dados do ICU e trava a
 * thread principal por ~65 ms numa CPU móvel lenta logo depois da hidratação.
 */
const SAO_PAULO_UTC_OFFSET_MINUTES = -3 * 60
const MINUTES_PER_DAY = 24 * 60

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatNow(now: Date = new Date()): string {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const minutes =
    (((utcMinutes + SAO_PAULO_UTC_OFFSET_MINUTES) % MINUTES_PER_DAY) + MINUTES_PER_DAY) %
    MINUTES_PER_DAY

  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

/** Relógio do fuso de Paraí: um detalhe humano na seção de contato. Só renderiza no cliente. */
export function LocalTime({ label, timezone }: { label: string; timezone: string }) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    setTime(formatNow())
    const id = window.setInterval(() => setTime(formatNow()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-70" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span>{label}</span>
      <time className="text-foreground tabular-nums" suppressHydrationWarning>
        {time ?? '--:--'}
      </time>
      <span>{timezone}</span>
    </p>
  )
}
