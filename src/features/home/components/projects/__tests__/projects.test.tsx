import { render, screen } from '@/tests/test-utils'
import { Projects } from '../projects'

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, values?: Record<string, string | number>) =>
      values ? `${key}:${Object.values(values).join(',')}` : key
    t.raw = (key: string) => key
    return t
  },
}))

vi.mock('@/shared/components/animations', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MagneticHover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ParallaxLayer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RevealText: ({ text }: { text: string }) => <h2>{text}</h2>,
}))

vi.mock('@/shared/config/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={`/en${href}`} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@/features/projects/data/projects.static', () => ({
  projectsData: [
    {
      id: 1,
      slug: 'project-1',
      i18nKey: 'project1',
      type: 'web',
      featured: true,
      image: '/img1.jpg',
      demo: 'https://project1.example',
      github: null,
      role: 'fullstack',
      year: 2026,
      company: 'Atto',
      category: 'saas',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      highlights: [],
      integrations: [],
    },
    {
      id: 2,
      slug: 'project-2',
      i18nKey: 'project2',
      type: 'mobile',
      featured: false,
      image: '/img2.jpg',
      demo: null,
      github: null,
      role: 'frontend',
      year: 2023,
      company: 'Luizalabs',
      category: 'enterprise',
      technologies: ['React Native'],
      highlights: [],
      integrations: [],
    },
    {
      id: 3,
      slug: 'project-3',
      i18nKey: 'project3',
      type: 'desktop',
      featured: true,
      image: '/img3.jpg',
      demo: null,
      github: null,
      role: 'fullstack',
      year: 2021,
      company: 'Pratio',
      category: 'saas',
      technologies: ['React', 'Electron'],
      highlights: [],
      integrations: [],
    },
  ],
}))

describe('Projects Component', () => {
  it('renders section title and subtitle', () => {
    const { container } = render(<Projects />)
    expect(container.querySelector('#projects')).toHaveAttribute('data-spectral-zone', 'balanced')
    expect(screen.getByText('title.part1 title.part2')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
    expect(screen.getByText('badge')).toBeInTheDocument()
  })

  it('renders one compact tile per featured project', () => {
    render(<Projects />)
    const tiles = screen.getAllByTestId('project-tile')
    expect(tiles).toHaveLength(2)
    expect(screen.getByText('list.project1.title')).toBeInTheDocument()
    expect(screen.getByText('list.project3.title')).toBeInTheDocument()
    expect(screen.queryByText('list.project2.title')).not.toBeInTheDocument()
    expect(screen.getByAltText('list.project1.title')).toHaveAttribute(
      'src',
      expect.stringContaining('img1.jpg'),
    )
  })

  it('links tiles to the live project when there is one, else to /projects', () => {
    render(<Projects />)
    const [live, internal] = screen.getAllByTestId('project-tile')
    expect(live).toHaveAttribute('href', 'https://project1.example')
    expect(live).toHaveAttribute('target', '_blank')
    expect(internal).toHaveAttribute('href', '/en/projects')
  })

  it('shows at most three technologies per tile', () => {
    render(<Projects />)
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.queryByText('PostgreSQL')).not.toBeInTheDocument()
  })

  it('renders view all button', () => {
    render(<Projects />)
    const link = screen.getByRole('link', { name: /viewAll/i })
    expect(link).toHaveAttribute('href', '/en/projects')
  })
})
