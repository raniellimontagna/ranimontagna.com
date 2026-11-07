'use client'

import { useEffect } from 'react'
import { StatusDocument, StatusView } from '@/shared/ui-2026'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Imported on demand: this boundary ships with every page's initial
    // JavaScript, and Sentry is only needed once an error actually happens.
    void import('@sentry/nextjs').then((Sentry) => Sentry.captureException(error))
  }, [error])

  return (
    <StatusDocument lang="pt-BR">
      <StatusView
        code="500"
        title="Algo quebrou"
        body={`Um erro inesperado aconteceu e já foi registrado.${error.digest ? ` Código: ${error.digest}.` : ''}`}
        actions={[
          { label: 'Tentar de novo', onClick: reset },
          { label: 'Voltar ao início', href: '/' },
        ]}
      />
    </StatusDocument>
  )
}
