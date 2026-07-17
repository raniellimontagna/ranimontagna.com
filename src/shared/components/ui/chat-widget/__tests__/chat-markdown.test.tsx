import { CHAT_CONTACT_LINKS } from '@/shared/lib/chat-links'
import { render, screen } from '@/tests/test-utils'
import { renderChatMarkdown } from '../chat-markdown'

const renderMarkdown = (content: string): void => {
  render(<p>{renderChatMarkdown(content)}</p>)
}

describe('renderChatMarkdown', () => {
  it.each(
    Object.entries(CHAT_CONTACT_LINKS),
  )('renders the exact approved %s URL as a safe link', (_name, target) => {
    renderMarkdown(`Acesse [meu perfil](${target}).`)

    expect(screen.getByRole('link', { name: 'meu perfil' })).toHaveAttribute('href', target)
    expect(screen.getByRole('link', { name: 'meu perfil' })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name: 'meu perfil' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
  })

  it.each([
    ['HTTP', 'http://ranimontagna.com'],
    ['JavaScript', 'javascript:alert(1)'],
    ['data', 'data:text/html,hello'],
    ['relative', '/contact'],
    ['trailing slash', 'https://ranimontagna.com/'],
    ['query string', 'https://ranimontagna.com?next=evil'],
    ['fragment', 'https://ranimontagna.com#contact'],
    ['lookalike host', 'https://ranimontagna.com.evil.example'],
    ['userinfo', 'https://ranimontagna.com@evil.example'],
    ['leading whitespace', ' https://ranimontagna.com'],
    ['trailing whitespace', 'https://ranimontagna.com '],
    ['Markdown title', 'https://ranimontagna.com "Portfolio"'],
  ])('keeps the label visible without a link for a %s target', (_case, target) => {
    renderMarkdown(`Acesse [destino bloqueado](${target}).`)

    expect(screen.getByText(/destino bloqueado/)).toBeVisible()
    expect(screen.queryByRole('link', { name: 'destino bloqueado' })).not.toBeInTheDocument()
  })

  it('keeps bold rendering and escapes HTML-like input as text', () => {
    renderMarkdown('Texto **forte** e <img src=x onerror=alert(1)>.')

    expect(screen.getByText('forte').tagName).toBe('STRONG')
    expect(screen.getByText(/<img src=x onerror=alert\(1\)>/)).toBeVisible()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
