'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

interface GlobalErrorProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          gap: '16px',
          margin: 0,
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '40px',
            borderRadius: '16px',
            border: '1px solid #1e293b',
            backgroundColor: '#1e293b',
            maxWidth: '400px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 800,
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}
          >
            Oops!
          </div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              margin: 0,
              color: '#f1f5f9',
            }}
          >
            Algo deu errado
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '10px 24px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
            <a
              href="/"
              style={{
                padding: '10px 24px',
                borderRadius: '9999px',
                border: '1px solid #334155',
                backgroundColor: 'transparent',
                color: '#e2e8f0',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Página inicial
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
