import type { Repository } from '@/features/projects/lib/github'
import { render, screen } from '@/tests/test-utils'
import { FeaturedProject } from '../featured-project'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockRepo: Repository = {
  id: 1,
  name: 'awesome-project',
  description: 'An awesome project',
  html_url: 'https://github.com/user/awesome-project',
  homepage: null,
  language: 'TypeScript',
  stargazers_count: 100,
  forks_count: 20,
  updated_at: '2024-01-01',
  topics: ['react', 'nextjs'],
  fork: false,
}

describe('FeaturedProject Component', () => {
  it('renders correctly', () => {
    render(<FeaturedProject repo={mockRepo} index={0} />)

    expect(screen.getByText('awesome-project')).toBeInTheDocument()
    expect(screen.getByText('An awesome project')).toBeInTheDocument()

    expect(screen.getByText('featured')).toBeInTheDocument()

    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('stars')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('forks')).toBeInTheDocument()

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('nextjs')).toBeInTheDocument()

    expect(screen.getByText('TypeScript')).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://github.com/user/awesome-project')
  })

  it('renders without description', () => {
    const repoWithoutDesc = { ...mockRepo, description: null }
    render(<FeaturedProject repo={repoWithoutDesc} index={0} />)

    expect(screen.getByText('noDescription')).toBeInTheDocument()
  })
})
