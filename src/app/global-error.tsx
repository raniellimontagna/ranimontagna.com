'use client'

import * as Sentry from '@sentry/nextjs'
import { Home, Restart } from '@solar-icons/react/ssr'
import { useEffect } from 'react'
import { ErrorLayout } from '@/shared/components/ui/error-view'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <ErrorLayout
      code="500"
      variant="danger"
      title="Algo quebrou"
      description="Ocorreu um erro inesperado no servidor. Nossa equipe já foi notificada e estamos trabalhando para resolver o quanto antes."
      errorId={error.digest}
    >
      <button
        type="button"
        onClick={reset}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-foreground px-6 py-4 font-bold text-background transition-all hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <Restart className="h-5 w-5 shrink-0 transition-transform group-hover:rotate-180 duration-700" />
        <span className="whitespace-nowrap">Tentar Novamente</span>
        <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </button>

      <a
        href="/"
        className="group flex items-center justify-center gap-2 rounded-2xl border border-line bg-surface px-6 py-4 font-bold transition-all hover:bg-surface-strong hover:scale-[1.02] active:scale-[0.98]"
      >
        <Home className="h-5 w-5 shrink-0" />
        <span className="whitespace-nowrap">Voltar ao Início</span>
      </a>
    </ErrorLayout>
  )
}
