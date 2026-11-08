import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { useChat } from '@/shared/store/use-chat/use-chat'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { act, fireEvent, render, screen, waitFor, within } from '@/tests/test-utils'
import pt from '../../../../messages/pt.json'
import { VegaScreen } from '../vega-screen'

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const lookup = (key: string) =>
      key
        .split('.')
        .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], pt.vega)
    const t = (key: string) => lookup(key) as string
    t.raw = (key: string) => lookup(key)
    return t
  },
  useLocale: () => 'pt',
}))

const { stopSmoothScroll, startSmoothScroll } = vi.hoisted(() => ({
  stopSmoothScroll: vi.fn(),
  startSmoothScroll: vi.fn(),
}))
vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  stopSmoothScroll,
  startSmoothScroll,
}))

const GRIMORY_CARD = {
  id: 'case-grimory',
  kind: 'case',
  href: '/projects/grimory',
  title: 'Grimory',
  summary: 'Mesa de D&D 5e em português, do personagem à sessão',
  image: '/redesign/products/grimory-mesa.webp',
}

function sse(events: unknown[]) {
  const body = `${events.map((e) => `data: ${JSON.stringify(e)}`).join('\n\n')}\n\ndata: [DONE]\n\n`
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
}

function openScreen() {
  const launcher = document.createElement('button')
  launcher.setAttribute('data-chat-launcher', '')
  document.body.appendChild(launcher)
  launcher.focus()
  act(() => useChat.setState({ isOpen: true }))
  return launcher
}

describe('VegaScreen', () => {
  beforeEach(() => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    useChat.setState({ isOpen: false, messages: [], isLoading: false, error: null })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        sse([{ text: 'O Grimory é o melhor exemplo.' }, { cards: [GRIMORY_CARD] }]),
      ),
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    for (const el of document.querySelectorAll('[data-chat-launcher]')) el.remove()
  })

  it('opens with the greeting, the big mark and four suggestions', () => {
    render(<VegaScreen />)
    openScreen()
    const dialog = screen.getByRole('dialog', { name: 'Vega' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(within(dialog).getByText('Oi, eu sou a Vega.')).toBeInTheDocument()
    expect(within(dialog).getByText('Por onde começamos?')).toBeInTheDocument()
    expect(dialog.querySelector('[data-vega-hero] canvas')).not.toBeNull()
    expect(
      within(dialog).getAllByRole('button', {
        name: /O que ele faz com IA\?|Me mostra o Grimory|Por onde ele passou\?|Quero falar com a Atto/,
      }),
    ).toHaveLength(4)
  })

  it('puts focus in the question field', () => {
    render(<VegaScreen />)
    openScreen()
    expect(screen.getByRole('textbox')).toHaveFocus()
  })

  it('keeps the question field at 16 px (no iOS zoom) without the inner focus ring', () => {
    render(<VegaScreen />)
    openScreen()
    const field = screen.getByRole('textbox')
    expect(field.className).toContain('text-base')
    expect(field.className).toContain('interactive-field-input')
  })

  it('gives the suggestions and the back button 44 px tap targets', () => {
    render(<VegaScreen />)
    openScreen()
    const targets = [
      screen.getByRole('button', { name: 'Voltar ao site' }),
      ...screen.getAllByRole('button', { name: /O que ele faz com IA\?|Me mostra o Grimory/ }),
    ]
    for (const target of targets) expect(target.className).toContain('min-h-11')
  })

  it('Escape closes it and returns focus to the launcher', () => {
    render(<VegaScreen />)
    const launcher = openScreen()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(useChat.getState().isOpen).toBe(false)
    expect(launcher).toHaveFocus()
  })

  it("'Voltar ao site' closes it", () => {
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao site' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('locks page scroll while open and restores it on close', () => {
    render(<VegaScreen />)
    openScreen()
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(stopSmoothScroll).toHaveBeenCalled()
    act(() => useChat.setState({ isOpen: false }))
    expect(document.documentElement.style.overflow).toBe('')
    expect(startSmoothScroll).toHaveBeenCalled()
  })

  it('a suggestion sends that question and the answer comes with its card', async () => {
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string)
    expect(body).toMatchObject({ message: 'Me mostra o Grimory', locale: 'pt' })
    expect(await screen.findByText('O Grimory é o melhor exemplo.')).toBeInTheDocument()
    const card = await screen.findByRole('link', { name: /Grimory/ })
    expect(card).toHaveAttribute('href', '/projects/grimory')
  })

  it('moves the mark to the corner once a conversation exists', async () => {
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    await screen.findByText('O Grimory é o melhor exemplo.')
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-state', 'conversation')
    expect(dialog.querySelector('[data-vega-hero]')).toBeNull()
    expect(dialog.querySelector('[data-vega-corner] canvas')).not.toBeNull()
  })

  it('shows the thinking status while loading', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    expect(screen.getByText('pensando…')).toBeInTheDocument()
  })

  it('a card click closes Vega', async () => {
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    fireEvent.click(await screen.findByRole('link', { name: /Grimory/ }))
    expect(useChat.getState().isOpen).toBe(false)
  })

  it('ignores cards with unknown kind or external href', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        sse([
          { text: 'Veja.' },
          {
            cards: [
              { ...GRIMORY_CARD, kind: 'evil' },
              { ...GRIMORY_CARD, id: 'x', href: '//evil.com' },
            ],
          },
        ]),
      ),
    )
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    await screen.findByText('Veja.')
    expect(screen.queryByRole('link', { name: /Grimory/ })).toBeNull()
  })

  it('shows the error with a working retry', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(sse([{ text: 'Agora foi.' }]))
    vi.stubGlobal('fetch', fetchMock)
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    expect(await screen.findByText('Não consegui responder agora.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText('Agora foi.')).toBeInTheDocument()
    expect(screen.getAllByText('Me mostra o Grimory')).toHaveLength(1)
  })

  it('closing and reopening shows each message once', async () => {
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    await screen.findByText('O Grimory é o melhor exemplo.')
    act(() => useChat.setState({ isOpen: false }))
    act(() => useChat.setState({ isOpen: true }))
    expect(screen.getAllByText('O Grimory é o melhor exemplo.')).toHaveLength(1)
    expect(screen.getAllByText('Me mostra o Grimory')).toHaveLength(1)
  })

  it('keeps the composer at the bottom of a full-height screen', async () => {
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    await screen.findByText('O Grimory é o melhor exemplo.')
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('h-dvh')
    expect(dialog.querySelector('[data-vega-composer]')?.className).toContain('sticky')
    expect(dialog.querySelector('[data-vega-composer]')?.className).toContain('bottom-0')
  })

  it('"Nova conversa" clears the conversation', async () => {
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    await screen.findByText('O Grimory é o melhor exemplo.')
    fireEvent.click(screen.getByRole('button', { name: 'Nova conversa' }))
    await waitFor(() => expect(useChat.getState().messages).toHaveLength(0))
    expect(screen.getByText('Oi, eu sou a Vega.')).toBeInTheDocument()
  })

  it('types a fresh answer word by word when motion is allowed', async () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    const busy = await waitFor(() => {
      const node = document.querySelector('[aria-busy="true"]')
      expect(node).not.toBeNull()
      return node as HTMLElement
    })
    expect(busy.textContent).not.toContain('O Grimory é o melhor exemplo.')
    expect(await screen.findByText('O Grimory é o melhor exemplo.')).toBeInTheDocument()
  })

  it('keeps focus inside the dialog after the first question and after "Nova conversa"', async () => {
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    await screen.findByText('O Grimory é o melhor exemplo.')
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Nova conversa' }))
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('Escape closes it even when focus has left the dialog', () => {
    render(<VegaScreen />)
    openScreen()
    ;(document.activeElement as HTMLElement | null)?.blur()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(useChat.getState().isOpen).toBe(false)
  })

  it('makes the page behind inert while open', () => {
    const page = document.createElement('div')
    page.setAttribute('data-testid', 'page')
    document.body.appendChild(page)
    render(<VegaScreen />)
    openScreen()
    expect(page).toHaveAttribute('inert')
    act(() => useChat.setState({ isOpen: false }))
    expect(page).not.toHaveAttribute('inert')
    page.remove()
  })

  it('returns focus to the button that opened it', () => {
    const hero = document.createElement('button')
    hero.textContent = 'Pergunte à Vega'
    document.body.appendChild(hero)
    render(<VegaScreen />)
    openScreen()
    act(() => useChat.setState({ isOpen: false }))
    hero.focus()
    act(() => useChat.setState({ isOpen: true }))
    act(() => useChat.setState({ isOpen: false }))
    expect(hero).toHaveFocus()
    hero.remove()
  })

  it('offers a retry under the static fallback', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(sse([{ text: 'Não consegui responder agora 😅' }, { fallback: true }]))
      .mockResolvedValueOnce(sse([{ text: 'Agora foi.' }]))
    vi.stubGlobal('fetch', fetchMock)
    render(<VegaScreen />)
    openScreen()
    fireEvent.click(screen.getByRole('button', { name: 'Me mostra o Grimory' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText('Agora foi.')).toBeInTheDocument()
    expect(screen.queryByText('Não consegui responder agora 😅')).toBeNull()
    expect(screen.getAllByText('Me mostra o Grimory')).toHaveLength(1)
  })

  it('draws the focus state on the question box, not a ring inside it', () => {
    render(<VegaScreen />)
    openScreen()
    const field = screen.getByRole('textbox')
    // The global :focus-visible rule is unlayered and beats Tailwind's focus-visible:outline-none.
    expect(field.className).toContain('interactive-field-input')
    expect(field.closest('form')?.className).toContain('focus-within:border-accent')
  })
})
