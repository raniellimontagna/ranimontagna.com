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
  RevealText: ({ text, className }: { text: string; className?: string }) => (
    <span className={className}>{text}</span>
  ),
  StaggerContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../experience.static', () => ({
  experiences: () => [
    {
      company: 'Lemon Energia',
      position: 'Software Engineer',
      period: '2026 - atual',
      location: 'Remoto',
      logo: '/companies/lemon-logo-green.png',
      description: 'desc 0',
      highlights: ['highlight 0'],
      technologies: ['JavaScript', 'TypeScript', 'AI'],
      current: true,
    },
    {
      company: 'Luizalabs',
      position: 'Senior Frontend Engineer',
      period: '2024 - atual',
      location: 'Remoto',
      logo: '/companies/luizalabs.webp',
      description: 'desc 1',
      highlights: ['highlight 1'],
      technologies: ['React', 'TypeScript'],
      current: false,
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

    expect(container.querySelector('#experience')).toHaveAttribute('data-spectral-zone', 'balanced')
    expect(container.querySelector(`.${['atmospheric', 'grid'].join('-')}`)).not.toBeInTheDocument()
    expect(screen.getByAltText('Logo Lemon Energia')).toBeInTheDocument()
    expect(screen.getByAltText('Logo Luizalabs')).toBeInTheDocument()
    expect(screen.getByAltText('Logo Smarten')).toBeInTheDocument()
    expect(
      screen.getByText('Lemon Energia', {
        selector: '[data-experience-panel="true"][data-experience-index="0"] *',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('currentLabel')).toBeInTheDocument()
    expect(screen.getAllByText('Senior Frontend Engineer').length).toBeGreaterThan(0)
    expect(container.querySelector('[data-experience-cylinder-stage="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-experience-pinned-stage="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-experience-mobile-carousel="true"]')).toBeInTheDocument()
    expect(
      container.querySelector('[data-experience-mobile-gesture-zone="true"]'),
    ).toBeInTheDocument()
    expect(container.querySelectorAll('[data-experience-mobile-slide="true"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-experience-mobile-details="true"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-experience-mobile-dot="true"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-experience-mobile-arrow="next"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-experience-mobile-arrow="prev"]')).toHaveLength(3)
    expect(container.querySelector('[data-experience-mobile-input="0"]')).toBeChecked()
    expect(container.querySelector('[data-experience-intro="true"]')).toHaveClass('min-w-0')
    expect(container.querySelector('[data-experience-cylinder-stage="true"]')).toHaveClass(
      'lg:items-start',
    )
    expect(screen.getByText('title.part1 title.part2')).toHaveClass('lg:whitespace-nowrap')
    expect(container.querySelector('[data-experience-mobile-carousel="true"]')).toHaveClass(
      'min-w-0',
    )
    expect(container.querySelector('[data-experience-panel-slot="true"]')).toBeInTheDocument()
    expect(container.querySelector('[data-experience-panel-slot="true"]')).toHaveClass('min-w-0')
    expect(container.querySelector('[data-experience-panel-slot="true"]')).toHaveClass(
      'hidden',
      'lg:grid',
    )
    expect(container.querySelector('[data-experience-rotary-stage="true"]')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-experience-panel="true"]')).toHaveLength(3)
    expect(container.querySelector('[data-experience-panel="true"]')).not.toHaveClass(
      'lg:overflow-y-auto',
      'lg:overscroll-contain',
    )
    expect(
      container.querySelector('[data-experience-panel="true"][data-experience-index="0"]'),
    ).toHaveTextContent('Lemon Energia')
    expect(
      container.querySelector('[data-experience-panel="true"][data-experience-index="0"]'),
    ).toHaveTextContent('currentLabel')
    expect(
      container.querySelector('[data-experience-panel="true"][data-experience-index="1"]'),
    ).toHaveTextContent('Luizalabs')
    expect(
      container.querySelectorAll('[data-experience-panel="true"][data-active="true"]'),
    ).toHaveLength(1)
    expect(container.querySelectorAll('[data-experience-panel-mark="true"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-experience-panel-heading="true"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-experience-panel-meta="true"]')).toHaveLength(3)
    expect(
      container.querySelector(
        '[data-experience-panel="true"][data-experience-index="0"] [data-experience-panel-meta="true"] > span:nth-child(2)',
      ),
    ).toHaveClass('whitespace-nowrap')
    expect(container.querySelectorAll('[data-experience-panel-body="true"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-experience-panel-highlight="true"]')).toHaveLength(3)
    expect(container.querySelectorAll('[data-experience-panel-tech="true"]')).toHaveLength(6)
    expect(screen.getByRole('button', { name: /Lemon Energia/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Luizalabs/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Smarten/ })).toBeInTheDocument()
    expect(screen.getAllByText('highlight 0').length).toBeGreaterThan(0)
    expect(screen.getAllByText('highlight 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('highlight 2').length).toBeGreaterThan(0)
  })
})
