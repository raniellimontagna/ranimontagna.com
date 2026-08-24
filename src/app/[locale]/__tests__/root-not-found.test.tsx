import { renderToStaticMarkup } from 'react-dom/server'
import RootNotFound from '../../not-found'

vi.mock('@/shared/components/ui/error-view', () => ({
  ErrorLayout: ({
    children,
    lang,
    title,
  }: {
    children: React.ReactNode
    lang?: string
    title: string
  }) => (
    <main lang={lang}>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}))

describe('root not found', () => {
  it('declares Portuguese for its Portuguese content', () => {
    const markup = renderToStaticMarkup(<RootNotFound />)
    const document = new DOMParser().parseFromString(markup, 'text/html')

    expect(document.querySelector('main')?.lang).toBe('pt-BR')
    expect(document.body.textContent).toContain('Página não encontrada')
  })
})
