import type { SVGProps } from 'react'
import { render, screen } from '@/tests/test-utils'
import { ServiceCard } from '../service-card'

const MockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props}>
    <title>Icon</title>
  </svg>
)

describe('ServiceCard', () => {
  const defaultProps = {
    title: 'Web Dev',
    description: 'Building websites',
    features: ['React', 'Next.js'],
    icon: MockIcon,
  }

  it('renders title and description', () => {
    render(<ServiceCard {...defaultProps} />)

    expect(screen.getByText('Web Dev')).toBeInTheDocument()
    expect(screen.getByText('Building websites')).toBeInTheDocument()
  })

  it('renders features list', () => {
    render(<ServiceCard {...defaultProps} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })

  it('renders popular badge if popular prop is true', () => {
    render(<ServiceCard {...defaultProps} popular={true} />)

    const card = screen.getByText('Web Dev').closest('div.group')
    expect(card?.className).toContain('border-accent/35')
  })

  it('links the CTA to the contact section', () => {
    render(<ServiceCard {...defaultProps} />)

    const ctaLink = screen.getByRole('link')
    expect(ctaLink).toHaveAttribute('href', '#contact')
  })
})
