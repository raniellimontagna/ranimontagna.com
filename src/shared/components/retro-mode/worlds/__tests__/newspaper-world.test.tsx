import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { NewspaperWorld } from '../newspaper-world'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  sessionStorage.clear()
})

it('prints today’s edition with the real navigation and the headlines', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 10, 17, 10))
  render(<NewspaperWorld locale="pt" onExit={vi.fn()} />)
  expect(screen.getByText(/PARAÍ · terça-feira, 17 de novembro de 2026/)).toBeInTheDocument()
  const nav = screen.getByRole('navigation', { name: 'Gazeta Montagna' })
  expect(within(nav).getByRole('link', { name: 'Projetos' })).toHaveAttribute('href', '/projects')

  expect(
    screen.getByText('Engenheiro de Paraí entrega produto no ar com a IA escrevendo o código', {
      selector: '.sr-only',
    }),
  ).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Próxima manchete ›' }))
  expect(
    screen.getByText(/Grimory leva a mesa de D&D/, { selector: '.sr-only' }),
  ).toBeInTheDocument()
})

it('runs classifieds on the back page with real ways to get in touch', () => {
  render(<NewspaperWorld locale="en" onExit={vi.fn()} />)
  const back = screen.getByRole('region', { name: 'Classifieds' })
  expect(back.parentElement).toBe(document.body)
  expect(within(back).getByRole('link', { name: 'Send an email ›' })).toHaveAttribute(
    'href',
    expect.stringMatching(/^mailto:contato@ranimontagna\.com\?subject=/),
  )
  const whatsapp = within(back).getByRole('link', { name: 'Message Atto on WhatsApp ›' })
  expect(whatsapp).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\//))
  expect(whatsapp).toHaveAttribute('target', '_blank')
  expect(within(back).getByRole('link', { name: 'Open the blog ›' })).toHaveAttribute(
    'href',
    '/blog',
  )
})

it('exits from the bottom bar', () => {
  const onExit = vi.fn()
  render(<NewspaperWorld locale="es" onExit={onExit} />)
  fireEvent.click(screen.getByRole('button', { name: /Volver al futuro/ }))
  expect(onExit).toHaveBeenCalledOnce()
})

// Turns reduced motion off, so it runs last.
it('spins the front page in once per session, then types the headline', () => {
  mockMatchMedia({})
  vi.useFakeTimers()
  const first = render(<NewspaperWorld locale="en" onExit={vi.fn()} />)
  expect(document.querySelector('.newspaper-spin')).toHaveTextContent('EXTRA! EXTRA!')
  act(() => vi.advanceTimersByTime(2700))
  expect(document.querySelector('.newspaper-spin')).toBeNull()

  const typed = () => document.querySelector('.newspaper-headline [aria-hidden]')?.textContent ?? ''
  const tick = (times: number) => {
    for (let i = 0; i < times; i++) act(() => vi.advanceTimersByTime(45))
  }
  tick(8)
  expect(typed().length).toBeGreaterThan(3)
  expect(typed().length).toBeLessThan(20)
  tick(80)
  expect(typed()).toBe('Engineer from Paraí ships products with AI writing the code')

  first.unmount()
  render(<NewspaperWorld locale="en" onExit={vi.fn()} />)
  expect(document.querySelector('.newspaper-spin')).toBeNull()
})
