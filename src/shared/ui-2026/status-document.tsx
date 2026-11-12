import type { ReactNode } from 'react'

/** The html shell for pages rendered outside the locale layout (root 404, global error). */
export function StatusDocument({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang} className="dark">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  )
}
