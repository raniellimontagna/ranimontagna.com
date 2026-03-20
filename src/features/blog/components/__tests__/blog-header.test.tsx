import { render, screen } from '@/tests/test-utils'
import { BlogHeader } from '../blog-header'

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
  usePathname: () => '/blog',
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('BlogHeader Component', () => {
  it('renders correctly', () => {
    render(<BlogHeader />)

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('backToPortfolio')).toBeInTheDocument()
  })
})
