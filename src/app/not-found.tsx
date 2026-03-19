'use client'

import { Home } from '@solar-icons/react/ssr'
import { ErrorLayout } from '@/shared/components/ui/error-view'

export default function NotFound() {
  return (
    <ErrorLayout
      code="404"
      lang="en"
      title="Página não encontrada"
      description="O endereço que você tentou acessar não existe ou foi removido. Que tal voltar para o início?"
    >
      <a
        href="/"
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-foreground px-10 py-4 font-semibold text-background transition-all hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
      >
        <Home className="h-5 w-5" />
        <span>Voltar ao Início</span>
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      </a>
    </ErrorLayout>
  )
}
