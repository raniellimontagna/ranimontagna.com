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
    render(<Experience />)

    expect(screen.getByAltText('Logo Luizalabs')).toBeInTheDocument()
    expect(screen.getByAltText('Logo Smarten')).toBeInTheDocument()
    expect(screen.getByText('currentLabel')).toBeInTheDocument()
    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument()
  })
})
