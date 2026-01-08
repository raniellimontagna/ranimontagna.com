import type { SVGProps } from 'react'
import { fireEvent, render, screen } from '@/tests/test-utils'
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
    expect(card).toHaveClass('border-blue-200')
  })

  it('scrolls to contact on button click', () => {
    // Mock scrollIntoView
    const scrollIntoView = vi.fn()
    const getElementById = vi.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView,
    } as unknown as HTMLElement)

    render(<ServiceCard {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(getElementById).toHaveBeenCalledWith('contact')
    expect(scrollIntoView).toHaveBeenCalled()

    getElementById.mockRestore()
  })
})
