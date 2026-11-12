import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { act, fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { SiteMenu } from '../site-menu'
import { SITE_NAV, type SiteNavId } from '../site-nav'

const labels = {
  open: 'Menu',
  close: 'Fechar',
  title: 'Navegação',
  socials: 'Redes',
  items: Object.fromEntries(SITE_NAV.map((item) => [item.id, item.id])) as Record<
    SiteNavId,
    string
  >,
}

describe('SiteMenu', () => {
  it('traps focus, closes on Escape, returns focus and lists the socials', () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Navegação' })
    expect(dialog).toContainElement(document.activeElement as HTMLElement)
    for (const name of ['LinkedIn', 'Instagram', 'X / Twitter', 'GitHub']) {
      expect(screen.getByRole('link', { name: new RegExp(name) })).toHaveAttribute(
        'target',
        '_blank',
      )
    }

    const focusables = dialog.querySelectorAll<HTMLElement>('a, button')
    focusables[focusables.length - 1].focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(focusables[0]).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes when a link is followed', () => {
    render(<SiteMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('link', { name: 'atto' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the open menu at the document body, outside the moving header', () => {
    render(
      <header style={{ transform: 'translateY(-100%)' }}>
        <SiteMenu labels={labels} />
      </header>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByRole('dialog', { name: 'Navegação' }).parentElement).toBe(document.body)
  })
})

describe('SiteMenu motion (opening A)', () => {
  type FakeAnimation = {
    finished: Promise<void>
    cancel: ReturnType<typeof vi.fn>
    reverse: ReturnType<typeof vi.fn>
    persist: ReturnType<typeof vi.fn>
    playState: AnimationPlayState
    resolve: () => void
    keyframes: Keyframe[]
  }
  let animations: FakeAnimation[] = []
  const original = Element.prototype.animate

  beforeEach(() => {
    animations = []
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: false })
    Element.prototype.animate = vi.fn(function (this: Element, keyframes: Keyframe[]) {
      let resolve = () => {}
      const finished = new Promise<void>((r) => {
        resolve = r
      })
      const animation = {
        finished,
        cancel: vi.fn(),
        reverse: vi.fn(),
        persist: vi.fn(),
        playState: 'finished' as AnimationPlayState,
        resolve,
        keyframes,
      }
      animations.push(animation)
      return animation as unknown as Animation
    }) as unknown as typeof Element.prototype.animate
  })
  afterEach(() => {
    Element.prototype.animate = original
    document.documentElement.style.overflow = ''
  })

  it('shows a two-bar icon and toggles aria-expanded', () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    expect(trigger.querySelectorAll('[data-burger] i')).toHaveLength(2)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('lines its title up with the header row', () => {
    render(<SiteMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const row = screen.getByText('Navegação').parentElement as HTMLElement
    expect(row.className).toContain('h-16')
  })

  it('anchors the links in the thumb zone and gives the socials big targets', () => {
    render(<SiteMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(document.querySelector('[data-menu-links]')?.className).toContain('justify-end')
    for (const name of ['LinkedIn', 'GitHub']) {
      expect(screen.getByRole('link', { name: new RegExp(name) }).className).toContain(
        'min-h-[46px]',
      )
    }
  })

  it('opens with the circle from the button and keeps the overlay until the close animation ends', async () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(trigger)
    expect(
      animations.some((a) =>
        a.keyframes.some((k) => String(k.clipPath ?? '').startsWith('circle(')),
      ),
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await act(async () => {
      for (const a of animations) a.resolve()
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('makes the links inert while it closes, but keeps its button live for a reopen', () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    const nav = document.querySelector('[data-menu-links]') as HTMLElement
    expect(nav.closest('[inert]')).not.toBeNull()
    const overlayButton = screen.getAllByRole('button').find((b) => b !== trigger) as HTMLElement
    expect(overlayButton.closest('[inert]')).toBeNull()
    fireEvent.click(trigger)
    expect(
      (document.querySelector('[data-menu-links]') as HTMLElement).closest('[inert]'),
    ).toBeNull()
  })

  it('closes when the browser goes back or forward', async () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(trigger)
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await act(async () => {
      for (const a of animations) a.resolve()
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('never animates the circle with reduced motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    render(<SiteMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(
      animations.some((a) => a.keyframes.some((k) => 'clipPath' in k || 'transform' in k)),
    ).toBe(false)
  })

  it('reopening while it closes ends open with the page scroll locked', () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(document.documentElement.style.overflow).toBe('hidden')
  })

  it('closing while it still opens plays the opening backwards instead of snapping open', async () => {
    render(<SiteMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    const opening = [...animations]
    for (const animation of opening) animation.playState = 'running'
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(animations).toHaveLength(opening.length)
    for (const animation of opening) expect(animation.reverse).toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await act(async () => {
      for (const animation of opening) animation.resolve()
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('reopening mid-close settles on the open state and drops the close frames', async () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    fireEvent.click(trigger)
    const opened = animations.length
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    const closing = animations.slice(opened)
    for (const animation of closing) animation.playState = 'running'
    fireEvent.click(trigger)
    for (const animation of closing) expect(animation.reverse).toHaveBeenCalled()
    await act(async () => {
      for (const animation of closing) animation.resolve()
    })
    for (const animation of closing) expect(animation.cancel).toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('places its button by the layout width, so a desktop scrollbar does not shift it', () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    trigger.getBoundingClientRect = () =>
      ({ left: 1300, right: 1400, top: 10, bottom: 54, width: 100, height: 44 }) as DOMRect
    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
    Object.defineProperty(document.documentElement, 'clientWidth', {
      value: 1425,
      configurable: true,
    })
    fireEvent.click(trigger)
    expect(screen.getByRole('button', { name: 'Fechar' }).style.right).toBe('25px')
  })

  it('keeps its button on screen when the header is tucked away', () => {
    render(<SiteMenu labels={labels} />)
    const trigger = screen.getByRole('button', { name: 'Menu' })
    trigger.getBoundingClientRect = () =>
      ({ left: 290, right: 380, top: -54, bottom: -10, width: 90, height: 44 }) as DOMRect
    fireEvent.click(trigger)
    const close = screen.getByRole('button', { name: 'Fechar' })
    expect(close.style.top).toBe('')
    expect(close.className).toContain('top-2.5')
  })

  it('sizes the links by the screen height too, so the socials fit on a laptop', () => {
    render(<SiteMenu labels={labels} />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByRole('link', { name: 'atto' }).className).toContain('svh')
  })
})
