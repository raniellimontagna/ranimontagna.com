import { forwardRef } from 'react'
import type { GitHubStats as GitHubStatsType } from '@/features/projects/lib/github'
import { render, screen } from '@/tests/test-utils'
import { GitHubStats } from '../github-stats'

let mockPrefersReducedMotion = false
let mockIsInView = false
const mockMotionProps = vi.fn()
const mockCountUpProps = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/shared/components/animations', () => ({
  CountUp: ({ value, delay, className }: Record<string, unknown>) => {
    mockCountUpProps({ value, delay, className })
    return (
      <span className={className as string} data-delay={String(delay)}>
        {value as number}
      </span>
    )
  },
}))

vi.mock('motion/react', () => ({
  motion: {
    div: forwardRef<
      HTMLDivElement,
      React.HTMLAttributes<HTMLDivElement> & {
        style?: Record<string, unknown>
        whileHover?: Record<string, unknown>
      }
    >(({ children, className, whileHover, ...props }, ref) => {
      mockMotionProps({ className, whileHover, ...props })
      return (
        <div ref={ref} className={className} data-testid="github-stat-card" {...props}>
          {children}
        </div>
      )
    }),
  },
  useInView: () => mockIsInView,
  useReducedMotion: () => mockPrefersReducedMotion,
}))

describe('GitHubStats', () => {
  const stats: GitHubStatsType = {
    public_repos: 24,
    total_stars: 135,
    followers: 89,
  }

  beforeEach(() => {
    mockPrefersReducedMotion = false
    mockIsInView = false
    mockMotionProps.mockClear()
    mockCountUpProps.mockClear()
  })

  it('renders the stats and keeps cards idle before they enter the viewport', () => {
    render(<GitHubStats stats={stats} />)

    expect(screen.getByText('stats.repos')).toBeInTheDocument()
    expect(screen.getByText('stats.stars')).toBeInTheDocument()
    expect(screen.getByText('stats.followers')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('135')).toBeInTheDocument()
    expect(screen.getByText('89')).toBeInTheDocument()
    expect(mockMotionProps).toHaveBeenCalledTimes(3)
    expect(mockMotionProps.mock.calls[0]?.[0]).toMatchObject({
      initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
      animate: undefined,
      transition: {
        delay: 0,
        duration: 0.7,
        ease: [0.19, 1, 0.22, 1],
      },
      whileHover: { y: -5, scale: 1.02 },
    })
  })

  it('stages card delays once the grid is visible', () => {
    mockIsInView = true

    render(<GitHubStats stats={stats} />)

    expect(mockMotionProps.mock.calls[0]?.[0]).toMatchObject({
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: expect.objectContaining({ delay: 0 }),
    })
    expect(mockMotionProps.mock.calls[1]?.[0]).toMatchObject({
      transition: expect.objectContaining({ delay: 0.12 }),
    })
    expect(mockMotionProps.mock.calls[2]?.[0]).toMatchObject({
      transition: expect.objectContaining({ delay: 0.24 }),
    })
    expect(
      mockCountUpProps.mock.calls.map(([props]) => Number((props.delay as number).toFixed(2))),
    ).toEqual([0.3, 0.45, 0.6])
  })

  it('removes hover motion and delays when reduced motion is enabled', () => {
    mockPrefersReducedMotion = true

    render(<GitHubStats stats={stats} />)

    expect(mockMotionProps.mock.calls[0]?.[0]).toMatchObject({
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      transition: {
        delay: 0,
        duration: 0,
        ease: [0.19, 1, 0.22, 1],
      },
      whileHover: undefined,
    })
  })
})
