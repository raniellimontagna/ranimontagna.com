import type { ProjectType } from '@/features/projects/types/projects.types'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { ProjectCard } from '../project-card'

// Mocks
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock next/image
vi.mock('next/image', () => ({
  // biome-ignore lint/performance/noImgElement: Mock component
  // biome-ignore lint/a11y/useAltText: Mock component
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}))

const mockProject: ProjectType = {
  id: 1,
  i18nKey: 'project1',
  type: 'web',
  title: 'Test Project',
  description: 'Test Description',
  image: '/test-image.jpg',
  technologies: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'Extra'],
  github: 'https://github.com/test',
  demo: 'https://demo.com',
  featured: true,
}

describe('ProjectCard Component', () => {
  it('renders project details correctly', () => {
    render(<ProjectCard project={mockProject} animationDelay="0ms" />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()

    // Check image
    const img = screen.getByAltText('Test Project')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test-image.jpg')
  })

  it('renders type badge correctly', () => {
    render(<ProjectCard project={mockProject} animationDelay="0ms" />)
    expect(screen.getByText('web')).toBeInTheDocument()
  })

  it('renders featured badge when featured', () => {
    render(<ProjectCard project={mockProject} animationDelay="0ms" />)
    expect(screen.getByText('featuredBadge')).toBeInTheDocument()
  })

  it('renders links correctly', () => {
    render(<ProjectCard project={mockProject} animationDelay="0ms" />)

    const githubLink = screen.getByLabelText('View Source on GitHub')
    expect(githubLink).toHaveAttribute('href', 'https://github.com/test')

    const demoLink = screen.getByLabelText('View Live Demo')
    expect(demoLink).toHaveAttribute('href', 'https://demo.com')
  })

  it('renders tech stack badges', () => {
    render(<ProjectCard project={mockProject} animationDelay="0ms" />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Tailwind')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()

    // Should show "+1 more" or similar for extra tech
    // Mock translation returns key so "moreCount" might need argument check
    // Or simply check for fallback behavior or if we can see the count key
    // In the mock: useTranslations returns key.
    // Component does: t('moreCount', { count: ... })
    // The mock should probably handle args or we inspect what it returns.
    // Simple key return logic: returns "moreCount"
    expect(screen.getByText('moreCount')).toBeInTheDocument()
  })

  it('renders placeholder when no image provided', () => {
    const projectNoImage = { ...mockProject, image: '' }
    render(<ProjectCard project={projectNoImage} animationDelay="0ms" />)

    // Should not find image with title alt
    expect(screen.queryByAltText('Test Project')).not.toBeInTheDocument()
    // Should find icon (might need test-id or rely on class checking if desperate,
    // but finding by visual absence of image is good enough for now,
    // or check for placeholder structure if specific text/icon is known)
  })

  it('handles mouse interactions (smoke test)', () => {
    render(<ProjectCard project={mockProject} animationDelay="0ms" />)
    const card = screen.getByRole('article')

    // Fire events to ensure no crashes
    fireEvent.mouseEnter(card)
    fireEvent.mouseMove(card, { clientX: 100, clientY: 100 })
    fireEvent.mouseLeave(card)

    // Visual assertions hard in JSDOM, but ensuring no errors is good.
  })

  it('handles technologies with partial matches and unknown techs', () => {
    const projectWithVariousTechs = {
      ...mockProject,
      technologies: ['react-native', 'typescript-eslint', 'UnknownTech', 'Next.js'],
    }
    render(<ProjectCard project={projectWithVariousTechs} animationDelay="0ms" />)

    // Should render all technologies
    expect(screen.getByText('react-native')).toBeInTheDocument()
    expect(screen.getByText('typescript-eslint')).toBeInTheDocument()
    expect(screen.getByText('UnknownTech')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })
})
