import { renderToStaticMarkup } from 'react-dom/server'
import RootNotFound from '../../not-found'

describe('root not found', () => {
  it('declares Portuguese for its Portuguese content and links home', () => {
    const markup = renderToStaticMarkup(<RootNotFound />)
    expect(markup).toContain('<html lang="pt-BR"')
    expect(markup).toContain('Página não encontrada')
    expect(markup).toContain('href="/"')
  })
})
