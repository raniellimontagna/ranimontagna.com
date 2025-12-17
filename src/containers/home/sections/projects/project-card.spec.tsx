import { render, screen } from '@/tests/functions'
import { ProjectCard } from './project-card'

const mockProject = {
  id: 1,
  i18nKey: 'test-project',
  title: 'Test Project',
  description: 'A test project description',
  type: 'web' as const,
  technologies: ['React', 'TypeScript', 'Next.js'],
  image: '/test-image.png',
  github: 'https://github.com/test/test',
  demo: 'https://test.com',
  featured: false,
}

describe('ProjectCard', () => {
  it('should render the project title', () => {
    render(<ProjectCard project={mockProject} animationDelay="0s" />)

    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('should render the project description', () => {
    render(<ProjectCard project={mockProject} animationDelay="0s" />)

    expect(screen.getByText('A test project description')).toBeInTheDocument()
  })

  it('should render technologies', () => {
    render(<ProjectCard project={mockProject} animationDelay="0s" />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('should render github link when provided', () => {
    render(<ProjectCard project={mockProject} animationDelay="0s" />)

    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/test/test',
    )
  })

  it('should render demo link when provided', () => {
    render(<ProjectCard project={mockProject} animationDelay="0s" />)

    expect(screen.getByRole('link', { name: /demo/i })).toHaveAttribute('href', 'https://test.com')
  })

  it('should render mobile type badge', () => {
    const mobileProject = { ...mockProject, type: 'mobile' as const }
    render(<ProjectCard project={mobileProject} animationDelay="0s" />)

    expect(screen.getByText('Mobile')).toBeInTheDocument()
  })

  it('should render api type badge', () => {
    const apiProject = { ...mockProject, type: 'api' as const }
    render(<ProjectCard project={apiProject} animationDelay="0s" />)

    expect(screen.getByText('Api')).toBeInTheDocument()
  })

  it('should show +N for more than 4 technologies', () => {
    const projectWithManyTechs = {
      ...mockProject,
      technologies: ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker'],
    }
    render(<ProjectCard project={projectWithManyTechs} animationDelay="0s" />)

    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})
