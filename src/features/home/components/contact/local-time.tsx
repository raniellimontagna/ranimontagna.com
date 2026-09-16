'use client'

import { useEffect, useState } from 'react'

const TIME_ZONE = 'America/Sao_Paulo'

function formatNow(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  }).format(new Date())
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
