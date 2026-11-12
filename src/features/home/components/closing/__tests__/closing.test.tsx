import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { Closing } from '../closing'
import { CopyEmailButton } from '../copy-email-button'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  getLocale: vi.fn().mockResolvedValue('pt'),
}))

describe('Closing', () => {
  it('links every social profile safely in a new tab', async () => {
    render(await Closing())
    for (const name of ['LinkedIn', 'Instagram', 'X / Twitter', 'GitHub']) {
      const link = screen.getByRole('link', { name: new RegExp(name) })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
    expect(document.getElementById('contato')).toBeInTheDocument()
  })

  it('points the Atto call to WhatsApp and offers the resume in the current language', async () => {
    render(await Closing())
    expect(screen.getByRole('link', { name: 'ctaAtto' }).getAttribute('href')).toMatch(
      /^https:\/\/wa\.me\/5554999906417\?text=/,
    )
    expect(screen.getByRole('link', { name: /resume/ })).toHaveAttribute('href', '/cv/pt.pdf')
    expect(screen.getByText('Ranielli Montagna', { selector: '.sr-only' })).toBeInTheDocument()
    // Each word stays whole and the name can break between words on narrow phones.
    const words = document.querySelectorAll('[data-name-word]')
    expect(words).toHaveLength(2)
    expect(words[0].className).toContain('whitespace-nowrap')
  })
})

describe('CopyEmailButton', () => {
  it('copies the email and announces it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(
      <CopyEmailButton email="contato@ranimontagna.com" label="Copiar e-mail" copied="Copiado" />,
    )
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copiar e-mail/ }))
    })
    expect(writeText).toHaveBeenCalledWith('contato@ranimontagna.com')
    expect(screen.getByRole('status')).toHaveTextContent('Copiado')
  })

  it('serves the résumé as a plain download link, outside the locale routing', async () => {
    render(await Closing())
    expect(screen.getByRole('link', { name: /resume/ })).toHaveAttribute('download')
  })
})
