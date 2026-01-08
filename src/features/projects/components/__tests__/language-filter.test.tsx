import { fireEvent, render, screen } from '@/tests/test-utils'
import { LanguageFilter } from '../language-filter'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({
      children,
      onClick,
      className,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button onClick={onClick} className={className} {...props}>
        {children}
      </button>
    ),
  },
}))

describe('LanguageFilter', () => {
  const mockOnSelect = vi.fn()
  const languages = ['TypeScript', 'JavaScript', 'Python']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "All" button and language buttons', () => {
    render(<LanguageFilter languages={languages} selected={null} onSelect={mockOnSelect} />)

    expect(screen.getByText('filters.all')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('calls onSelect with null when "All" button is clicked', () => {
    render(<LanguageFilter languages={languages} selected={null} onSelect={mockOnSelect} />)

    const allButton = screen.getByText('filters.all')
    fireEvent.click(allButton)

    expect(mockOnSelect).toHaveBeenCalledWith(null)
  })

  it('calls onSelect with language when language button is clicked', () => {
    render(<LanguageFilter languages={languages} selected={null} onSelect={mockOnSelect} />)

    const tsButton = screen.getByText('TypeScript')
    fireEvent.click(tsButton)

    expect(mockOnSelect).toHaveBeenCalledWith('TypeScript')
  })

  it('applies selected styling to "All" button when selected is null', () => {
    render(<LanguageFilter languages={languages} selected={null} onSelect={mockOnSelect} />)

    const allButton = screen.getByText('filters.all')
    expect(allButton).toHaveClass('bg-purple-600')
  })

  it('applies selected styling to language button when that language is selected', () => {
    render(<LanguageFilter languages={languages} selected="TypeScript" onSelect={mockOnSelect} />)

    const tsButton = screen.getByText('TypeScript')
    expect(tsButton).toHaveClass('bg-purple-600')
  })

  it('renders language color indicators', () => {
    const { container } = render(
      <LanguageFilter languages={languages} selected={null} onSelect={mockOnSelect} />,
    )

    // Each language button should have a color indicator span
    const colorIndicators = container.querySelectorAll('.h-2\\.5.w-2\\.5.rounded-full')
    expect(colorIndicators.length).toBe(languages.length)
  })
})
