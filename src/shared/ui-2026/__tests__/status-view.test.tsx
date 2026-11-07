import { REDUCED_MOTION_QUERY } from '@/shared/components/motion'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { StatusView } from '../status-view'

describe('StatusView', () => {
  it('renders the code, the title and real actions', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const retry = vi.fn()
    render(
      <StatusView
        code="404"
        title="Página não encontrada"
        body="Esse endereço não existe."
        actions={[
          { label: 'Início', href: '/' },
          { label: 'Tentar de novo', onClick: retry },
        ]}
      />,
    )
    expect(
      screen.getByRole('heading', { level: 1, name: 'Página não encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByText('404', { selector: '.sr-only' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/')
    fireEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(retry).toHaveBeenCalled()
  })

  it('does not scramble under reduced motion', () => {
    mockMatchMedia({ [REDUCED_MOTION_QUERY]: true })
    const setIntervalSpy = vi.spyOn(window, 'setInterval')
    render(<StatusView code="404" title="t" body="b" actions={[]} />)
    expect(setIntervalSpy).not.toHaveBeenCalled()
    expect(document.querySelector('[data-status-code]')).toHaveTextContent('404')
    setIntervalSpy.mockRestore()
  })
})
