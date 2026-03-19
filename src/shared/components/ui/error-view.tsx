'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import '@/app/[locale]/globals.css'

interface ErrorContentProps {
  code: string | number
  title: string
  description: string
  children?: ReactNode
  footer?: ReactNode
  variant?: 'accent' | 'danger'
  errorId?: string
}

export function ErrorContent({
  code,
  title,
  description,
  children,
  footer,
  variant = 'accent',
  errorId,
}: ErrorContentProps) {
  const isDanger = variant === 'danger'

  return (
    <main className="relative flex min-h-screen w-full flex-col selection:bg-accent selection:text-background overflow-x-hidden">
      {/* Background Gradients */}
      <div className="pointer-events-none fixed inset-0 -z-10 atmospheric-grid opacity-30" />
      <div className="fixed top-0 right-1/4 -z-10 h-112 w-md rounded-full bg-accent-ice/10 blur-[120px]" />
      <div className="fixed bottom-0 left-1/4 -z-10 h-112 w-md rounded-full bg-accent/5 blur-[120px]" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 p-4 py-12 sm:gap-8 sm:p-8">
        {/* Main Error Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="surface-panel-strong relative max-w-xl w-full shrink-0 overflow-hidden rounded-4xl border border-line p-8 text-center shadow-2xl sm:p-10"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(113,205,255,0.05),transparent_40%)]" />

          <div className="relative z-10">
            {/* Error Code Bubble */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div
                  className={`absolute inset-0 blur-3xl ${isDanger ? 'bg-red-500/30' : 'bg-accent/30'}`}
                />
                <div
                  className={`relative flex h-20 min-w-24 items-center justify-center rounded-3xl bg-linear-to-br px-6 border shadow-2xl transition-all ${
                    isDanger
                      ? 'from-red-500/20 to-red-600/10 border-red-500/30 ring-1 ring-red-500/20'
                      : 'from-accent/20 to-accent-strong/10 border-accent/20 ring-1 ring-accent/20'
                  }`}
                >
                  <span
                    className={`font-display text-4xl font-bold tracking-tighter sm:text-5xl ${
                      isDanger ? 'text-red-500' : 'text-accent-strong'
                    }`}
                  >
                    {code}
                  </span>
                </div>
              </div>
            </div>

            <h1 className="mb-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
              <span
                className={`bg-linear-to-r bg-clip-text text-transparent ${
                  isDanger ? 'from-red-400 to-red-600' : 'from-accent to-accent-strong'
                }`}
              >
                {title}
              </span>
            </h1>

            <p className="text-muted text-base mb-10 leading-relaxed max-w-md mx-auto">
              {description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full *:w-full sm:*:w-auto">
              {children}
            </div>

            {errorId && (
              <div className="group mt-8 flex items-center justify-center gap-2">
                <div className="h-px w-4 bg-line transition-all group-hover:w-8" />
                <p className="font-mono text-[10px] text-muted/60 uppercase tracking-widest">
                  ID: <code className="text-muted font-bold transition-colors group-hover:text-foreground">{errorId}</code>
                </p>
                <div className="h-px w-4 bg-line transition-all group-hover:w-8" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Optional Footer Content (e.g., Suggestions) */}
        {footer && <div className="w-full max-w-4xl shrink-0">{footer}</div>}
      </div>
    </main>
  )
}

export interface ErrorLayoutProps extends ErrorContentProps {
  lang?: string
}

export function ErrorLayout({ lang = 'pt', ...props }: ErrorLayoutProps) {
  return (
    <html lang={lang} className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        <ErrorContent {...props} />
      </body>
    </html>
  )
}
