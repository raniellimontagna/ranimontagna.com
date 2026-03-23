import { render, screen } from '@/tests/test-utils'
import { Projects } from '../projects'

// Mocks
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
    // biome-ignore lint/performance/noImgElement: test double for next/image
  }) => <img alt={alt} {...props} />,
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
  BlurReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
      slug: 'project-1',
      i18nKey: 'project1',
      type: 'web',
      featured: true,
      image: '/img1.jpg',
      images: ['/img1.jpg', '/img1-2.jpg'],
      technologies: ['React'],
      role: 'fullstack',
      year: 2024,
      company: 'Company A',
      category: 'saas',
      highlights: ['dashboard'],
      integrations: [],
    },
    {
      id: '2',
      slug: 'project-2',
      i18nKey: 'project2',
      type: 'mobile',
      featured: false, // Should be filtered out
      image: '/img2.jpg',
      technologies: ['React Native'],
      role: 'frontend',
      year: 2023,
      company: 'Company B',
      category: 'enterprise',
      highlights: [],
      integrations: [],
    },
    {
      id: '3',
      slug: 'project-3',
      i18nKey: 'project3',
      type: 'web',
      featured: true,
      image: '/img3.jpg',
      technologies: ['Node.js'],
      role: 'backend',
      year: 2022,
      company: 'Company C',
      category: 'saas',
      highlights: ['reports'],
      integrations: [],
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
    expect(screen.getByAltText('list.project1.title')).toHaveAttribute('src', '/img1.jpg')
    expect(screen.getByAltText(/list\.project1\.title.*2/)).toHaveAttribute('src', '/img1-2.jpg')
  })

  it('renders view all button', () => {
    render(<Projects />)
    const link = screen.getByRole('link', { name: /viewAll/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/en/projects')
  })
})
