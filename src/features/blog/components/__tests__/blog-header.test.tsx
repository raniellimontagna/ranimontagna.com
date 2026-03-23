import { render, screen } from '@/tests/test-utils'
import { BlogHeader } from '../blog-header'

let mockPathname = '/blog'

vi.mock('@/shared/components/layout/header/header', () => ({
  Header: ({
    title,
    backHref,
    backLabel,
  }: {
    title: string
    backHref: string
    backLabel: string
  }) => (
    <div data-testid="header">
      <span>{title}</span>
      <span>{backHref}</span>
      <span>{backLabel}</span>
    </div>
  ),
}))

vi.mock('@/shared/config/i18n/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('BlogHeader Component', () => {
  beforeEach(() => {
    mockPathname = '/blog'
  })

  it('renders correctly', () => {
    render(<BlogHeader />)

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('backToPortfolio')).toBeInTheDocument()
  })

  it('links back to the blog index when rendered inside a post page', () => {
    mockPathname = '/blog/branch-coverage'

    render(<BlogHeader />)

    expect(screen.getByText('/blog')).toBeInTheDocument()
    expect(screen.getByText('backToBlog')).toBeInTheDocument()
  })
})
