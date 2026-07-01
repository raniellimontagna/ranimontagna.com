import { render, screen } from '@/tests/test-utils'
import { Experience } from '../experience'

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) => {
      if (key === 'logoAlt') return `Logo ${params?.company ?? ''}`.trim()
      return key
    }

    t.raw = (key: string) => [`${key}.1`, `${key}.2`]
    return t
  },
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

vi.mock('@/shared/components/animations', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ParallaxLayer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RevealText: ({ text }: { text: string }) => <span>{text}</span>,
  StaggerContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../experience.static', () => ({
  experiences: () => [
    {
      company: 'Luizalabs',
      position: 'Senior Frontend Engineer',
      period: '2024 - atual',
      location: 'Remoto',
      logo: '/companies/luizalabs.webp',
      description: 'desc 1',
      highlights: ['highlight 1'],
      technologies: ['React', 'TypeScript'],
      current: true,
    },
    {
      company: 'Smarten',
      position: 'Frontend Developer',
      period: '2022 - 2024',
      location: 'Brasil',
      logo: '/companies/smarten.webp',
      description: 'desc 2',
      highlights: ['highlight 2'],
      technologies: ['React'],
      current: false,
    },
  ],
}))

describe('Experience', () => {
  it('renders company marks and current badge', () => {
    const { container } = render(<Experience />)

    expect(screen.getByAltText('Logo Luizalabs')).toBeInTheDocument()
    expect(screen.getByAltText('Logo Smarten')).toBeInTheDocument()
    expect(screen.getByText('currentLabel')).toBeInTheDocument()
    expect(screen.getAllByText('Senior Frontend Engineer').length).toBeGreaterThan(0)
    expect(container.querySelector('[data-experience-cylinder-stage="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-experience-pinned-stage="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-experience-mobile-carousel="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-experience-mobile-gesture-zone="true"]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-experience-mobile-slide="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-mobile-details="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-mobile-dot="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-mobile-arrow="next"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-mobile-arrow="prev"]')).toHaveLength(2)
    expect(container.querySelector('[data-experience-mobile-input="0"]')).toBeChecked()
    expect(container.querySelector('[data-experience-intro="true"]')).toHaveClass('min-w-0')
    expect(container.querySelector('[data-experience-mobile-carousel="true"]')).toHaveClass('min-w-0')
    expect(container.querySelector('[data-experience-panel-slot="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-experience-panel-slot="true"]')).toHaveClass('min-w-0')
    expect(container.querySelector('[data-experience-panel-slot="true"]')).toHaveClass('hidden', 'lg:grid')
    expect(container.querySelector('[data-experience-rotary-stage="true"]')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-experience-panel="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-panel="true"][data-active="true"]')).toHaveLength(
      1,
    )
    expect(container.querySelectorAll('[data-experience-panel-mark="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-panel-heading="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-panel-meta="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-panel-body="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-panel-highlight="true"]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-experience-panel-tech="true"]')).toHaveLength(3)
    expect(screen.getByRole('button', { name: /Luizalabs/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Smarten/ })).toBeInTheDocument()
    expect(screen.getAllByText('highlight 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('highlight 2').length).toBeGreaterThan(0)
  })
})
