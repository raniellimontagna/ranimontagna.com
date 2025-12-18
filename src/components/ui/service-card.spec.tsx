import { Code } from 'lucide-react'
import { render, screen } from '@/tests/functions'
import { ServiceCard } from './service-card'

describe('ServiceCard', () => {
  const defaultProps = {
    title: 'Test Service',
    description: 'Test description',
    features: ['Feature 1', 'Feature 2'],
    icon: Code,
  }

  it('should render the service card with title', () => {
    render(<ServiceCard {...defaultProps} />)

    expect(screen.getByText('Test Service')).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(<ServiceCard {...defaultProps} />)

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('should render all features', () => {
    render(<ServiceCard {...defaultProps} />)

    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    expect(screen.getByText('Feature 2')).toBeInTheDocument()
  })

  it('should render popular badge when popular is true', () => {
    render(<ServiceCard {...defaultProps} popular />)

    expect(screen.getByText(/popular/i)).toBeInTheDocument()
  })

  it('should not render popular badge when popular is false', () => {
    render(<ServiceCard {...defaultProps} popular={false} />)

    expect(screen.queryByText(/popular/i)).not.toBeInTheDocument()
  })
})
