import { render, screen } from '@/tests/test-utils'
import { ProjectsHeader } from '../projects-header'

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

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('ProjectsHeader Component', () => {
  it('renders correctly', () => {
    render(<ProjectsHeader />)

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByText('breadcrumb')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('backToPortfolio')).toBeInTheDocument()
  })
})
