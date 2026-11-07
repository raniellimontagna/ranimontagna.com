import { fireEvent, render, screen } from '@/tests/test-utils'
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
})
