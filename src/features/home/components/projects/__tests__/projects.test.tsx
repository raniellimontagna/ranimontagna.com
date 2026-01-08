import { render, screen } from '@/tests/test-utils'
import { Projects } from '../projects'

// Mocks
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('@/shared/components/animations', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../project-card', () => ({
  ProjectCard: ({ project }: { project: { title: string } }) => (
    <div data-testid="project-card">{project.title}</div>
  ),
}))

// Mock data
vi.mock('@/features/projects/data/projects.static', () => ({
  projectsData: [
    {
      id: '1',
      i18nKey: 'project1',
      type: 'web',
      featured: true,
      image: '/img1.jpg',
      technologies: ['React'],
    },
    {
      id: '2',
      i18nKey: 'project2',
      type: 'mobile',
      featured: false, // Should be filtered out
      image: '/img2.jpg',
      technologies: ['React Native'],
    },
    {
      id: '3',
      i18nKey: 'project3',
      type: 'api',
      featured: true,
      image: '/img3.jpg',
      technologies: ['Node.js'],
    },
  ],
}))

describe('Projects Component', () => {
  it('renders section title and subtitle', () => {
    render(<Projects />)
    expect(screen.getByText('title.part1')).toBeInTheDocument()
    expect(screen.getByText('title.part2')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    expect(screen.getByText('badge')).toBeInTheDocument()
  })

  it('renders featured projects only', () => {
    render(<Projects />)
    // Should render mock ProjectCards for featured projects
    const cards = screen.getAllByTestId('project-card')
    expect(cards).toHaveLength(2)
    // Check titles (derived from i18nKey in the component)
    expect(screen.getByText('list.project1.title')).toBeInTheDocument()
    expect(screen.getByText('list.project3.title')).toBeInTheDocument()
    // Should NOT render non-featured project
    expect(screen.queryByText('list.project2.title')).not.toBeInTheDocument()
  })

  it('renders view all button', () => {
    render(<Projects />)
    const link = screen.getByRole('link', { name: /viewAll/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/en/projects')
  })
})
