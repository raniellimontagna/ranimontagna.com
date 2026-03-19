import { render, screen } from '@/tests/test-utils'
import { Projects } from '../projects'

// Mocks
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('@/shared/config/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={`/en${href}`} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/shared/components/animations', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MagneticHover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ParallaxLayer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RevealText: ({ text }: { text: string }) => <span>{text}</span>,
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
    expect(screen.getByText('title.part1 title.part2')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    expect(screen.getByText('badge')).toBeInTheDocument()
  })

  it('renders featured projects only', () => {
    render(<Projects />)
    // Secondary featured projects remain in the reusable ProjectCard layout.
    const cards = screen.getAllByTestId('project-card')
    expect(cards).toHaveLength(1)

    // The first featured item is promoted to the lead showcase.
    expect(screen.getByText('list.project1.title')).toBeInTheDocument()
    expect(screen.getByText('list.project3.title')).toBeInTheDocument()
    expect(screen.queryByText('list.project2.title')).not.toBeInTheDocument()
  })

  it('renders view all button', () => {
    render(<Projects />)
    const link = screen.getByRole('link', { name: /viewAll/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/en/projects')
  })
})
