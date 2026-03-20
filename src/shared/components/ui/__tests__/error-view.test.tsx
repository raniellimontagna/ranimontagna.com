import { renderToStaticMarkup } from 'react-dom/server'
import { render, screen } from '@/tests/test-utils'
import { ErrorContent, ErrorLayout } from '../error-view'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
  },
}))

describe('ErrorContent', () => {
  it('renders accent content with actions, footer and error id', () => {
    render(
      <ErrorContent
        code={404}
        title="Page Missing"
        description="The requested page could not be found."
        errorId="err-404"
        footer={<div>Helpful footer</div>}
      >
        <button type="button">Retry</button>
        <a href="/">Go Home</a>
      </ErrorContent>,
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('404')).toHaveClass('text-accent-strong')
    expect(screen.getByText('Page Missing')).toHaveClass('from-accent', 'to-accent-strong')
    expect(screen.getByText('The requested page could not be found.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Helpful footer')).toBeInTheDocument()
    expect(screen.getByText('err-404')).toBeInTheDocument()
  })

  it('renders danger variant without optional sections', () => {
    render(
      <ErrorContent
        code="500"
        title="Server Error"
        description="Something unexpected happened."
        variant="danger"
      />,
    )

    expect(screen.getByText('500')).toHaveClass('text-red-500')
    expect(screen.getByText('Server Error')).toHaveClass('from-red-400', 'to-red-600')
    expect(screen.queryByText(/ID:/i)).not.toBeInTheDocument()
  })
})

describe('ErrorLayout', () => {
  it('renders a full document shell with the provided language', () => {
    const markup = renderToStaticMarkup(
      <ErrorLayout
        lang="en"
        code={401}
        title="Unauthorized"
        description="You do not have access."
      />,
    )

    expect(markup).toContain('<html lang="en" class="dark">')
    expect(markup).toContain('Unauthorized')
    expect(markup).toContain('You do not have access.')
    expect(markup).toContain('bg-background text-foreground antialiased min-h-screen')
  })
})
