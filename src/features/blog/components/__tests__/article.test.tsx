import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { articleComponents } from '../article-body'
import { ArticleImage } from '../article-image'
import { CodeBlock } from '../code-block'
import { PostNav } from '../post-nav'

vi.mock('../mermaid-diagram', () => ({
  MermaidDiagram: ({ chart }: { chart: string }) => <div data-testid="mermaid">{chart}</div>,
}))

describe('article MDX components', () => {
  it('renders mermaid fences as diagrams and other fences as copyable code', () => {
    const Pre = articleComponents.pre
    const { rerender } = render(
      <Pre>
        <code className="language-mermaid">{'graph LR\nA-->B'}</code>
      </Pre>,
    )
    expect(screen.getByTestId('mermaid')).toHaveTextContent('graph LR')

    rerender(
      <Pre>
        <code className="language-ts">const a = 1</code>
      </Pre>,
    )
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  it('never nests an image figure inside a paragraph (hydration-safe HTML)', () => {
    const P = articleComponents.p
    const Img = articleComponents.img
    const { container } = render(
      <P>
        <Img src="https://media.example.com/a.webp" alt="Tela" />
      </P>,
    )
    expect(container.querySelector('p figure')).toBeNull()
    expect(container.querySelector('figure img')).not.toBeNull()
  })

  it('keeps regular paragraphs as paragraphs', () => {
    const P = articleComponents.p
    const { container } = render(<P>texto</P>)
    expect(container.querySelector('p')).toHaveTextContent('texto')
  })

  it('opens external links in a new tab safely', () => {
    const A = articleComponents.a
    render(<A href="https://example.com">fora</A>)
    expect(screen.getByRole('link', { name: 'fora' })).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('CodeBlock', () => {
  it('copies the code to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(
      <CodeBlock>
        <code>pnpm test</code>
      </CodeBlock>,
    )
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    })
    expect(writeText).toHaveBeenCalledWith('pnpm test')
  })
})

describe('ArticleImage', () => {
  it('opens the image in a dialog and closes with Escape', () => {
    render(
      <ArticleImage
        src="https://media.example.com/a.webp"
        alt="Diagrama do fluxo"
        zoomLabel="Ampliar"
        closeLabel="Fechar"
      />,
    )
    expect(screen.getByAltText('Diagrama do fluxo')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Ampliar/ }))
    const dialog = document.querySelector('dialog') as HTMLDialogElement
    expect(dialog.open).toBe(true)
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(dialog.open).toBe(false)
  })
})

describe('PostNav', () => {
  it('links the previous and next posts', () => {
    render(
      <PostNav
        prev={{ slug: 'older', title: 'Older post' }}
        next={{ slug: 'newer', title: 'Newer post' }}
        labels={{ previous: 'Anterior', next: 'Próximo', back: 'Voltar ao blog' }}
      />,
    )
    expect(screen.getByRole('link', { name: /Older post/ })).toHaveAttribute('href', '/blog/older')
    expect(screen.getByRole('link', { name: /Newer post/ })).toHaveAttribute('href', '/blog/newer')
    expect(screen.getByRole('link', { name: 'Voltar ao blog' })).toHaveAttribute('href', '/blog')
  })
})
