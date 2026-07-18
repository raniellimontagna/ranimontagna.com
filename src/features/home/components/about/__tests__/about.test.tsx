import { render, screen } from '@/tests/test-utils'
import { About } from '../about'

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
    // biome-ignore lint/performance/noImgElement: test double for next/image.
  }) => <img alt={alt} data-priority={priority ? 'true' : undefined} {...props} />,
}))

vi.mock('@/shared/components/animations', () => ({
  BlurReveal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CountUp: ({ value, suffix }: { value: number; suffix?: string }) => (
    <span>
      {value}
      {suffix}
    </span>
  ),
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MagneticHover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ParallaxLayer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RevealText: ({ text }: { text: string }) => <span>{text}</span>,
}))

vi.mock('@/shared/lib/social-links', () => ({
  getResumeByLocale: () => ({
    filename: 'resume.pdf',
    href: '/cv/en.pdf',
    name: 'Resume',
  }),
}))

describe('About', () => {
  it('does not preload the below-the-fold profile image', () => {
    const { container } = render(<About />)

    expect(screen.getByTestId('about')).toHaveAttribute('data-spectral-zone', 'balanced')
    expect(container.querySelector(`.${['atmospheric', 'grid'].join('-')}`)).not.toBeInTheDocument()
    expect(screen.getByAltText('bio.name')).not.toHaveAttribute('data-priority', 'true')
  })
})
