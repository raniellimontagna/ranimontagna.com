import type { Repository } from '@/features/projects/lib/github'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { ProjectCard } from '../project-card'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}))

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = () => ({
    fromNow: () => '2 days ago',
  })
  mockDayjs.extend = vi.fn()
  return { default: mockDayjs }
})

describe('ProjectCard', () => {
  const mockRepo: Repository = {
    id: 1,
    name: 'test-repo',
    description: 'A test repository',
    html_url: 'https://github.com/user/test-repo',
    homepage: 'https://test-repo.com',
    stargazers_count: 42,
    forks_count: 10,
    language: 'TypeScript',
    topics: ['react', 'typescript', 'testing', 'vitest'],
    updated_at: '2024-01-01',
    fork: false,
  }

  it('renders repository name and description', () => {
    render(<ProjectCard repo={mockRepo} index={0} />)

    expect(screen.getByText('test-repo')).toBeInTheDocument()
    expect(screen.getByText('A test repository')).toBeInTheDocument()
  })

  it('renders stars and forks count', () => {
    render(<ProjectCard repo={mockRepo} index={0} />)

    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders language indicator with correct language', () => {
    render(<ProjectCard repo={mockRepo} index={0} />)

    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders homepage button when homepage is available', () => {
    render(<ProjectCard repo={mockRepo} index={0} />)

    const homepageButton = screen.getByLabelText('visitSite')
    expect(homepageButton).toBeInTheDocument()
  })

  it('does not render homepage button when homepage is not available', () => {
    const repoWithoutHomepage = { ...mockRepo, homepage: null }
    render(<ProjectCard repo={repoWithoutHomepage} index={0} />)

    const homepageButton = screen.queryByLabelText('visitSite')
    expect(homepageButton).not.toBeInTheDocument()
  })

  it('opens homepage in new window when homepage button is clicked', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<ProjectCard repo={mockRepo} index={0} />)

    const homepageButton = screen.getByLabelText('visitSite')
    fireEvent.click(homepageButton)

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://test-repo.com',
      '_blank',
      'noopener,noreferrer',
    )

    windowOpenSpy.mockRestore()
  })

  it('renders topics (max 3 visible)', () => {
    render(<ProjectCard repo={mockRepo} index={0} />)

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument() // 4 topics total, showing 3 + count
  })

  it('renders "No description" fallback when description is missing', () => {
    const repoWithoutDescription = { ...mockRepo, description: null }
    render(<ProjectCard repo={repoWithoutDescription} index={0} />)

    expect(screen.getByText('noDescription')).toBeInTheDocument()
  })

  it('renders updated time', () => {
    render(<ProjectCard repo={mockRepo} index={0} />)

    expect(screen.getByText('2 days ago')).toBeInTheDocument()
  })

  it('renders repository link with correct href', () => {
    const { container } = render(<ProjectCard repo={mockRepo} index={0} />)

    const link = container.querySelector('a[href="https://github.com/user/test-repo"]')
    expect(link).toBeInTheDocument()
  })
})
