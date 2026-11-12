import { StatusDocument, StatusView } from '@/shared/ui-2026'

export default function NotFound() {
  return (
    <StatusDocument lang="pt-BR">
      <StatusView
        code="404"
        title="Página não encontrada"
        body="O endereço que você tentou acessar não existe ou foi removido."
        actions={[
          { label: 'Voltar ao início', href: '/' },
          { label: 'Blog', href: '/blog' },
        ]}
      />
    </StatusDocument>
  )
}
