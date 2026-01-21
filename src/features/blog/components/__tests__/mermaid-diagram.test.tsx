import { render, waitFor } from '@/tests/test-utils'
import { MermaidDiagram } from '../mermaid-diagram'

// Mock mermaid library
vi.mock('mermaid', () => {
  const mockRender = vi.fn()
  const mockInitialize = vi.fn()

  return {
    default: {
      initialize: mockInitialize,
      render: mockRender,
    },
  }
})

// Access mocked functions after the module is mocked
const mermaid = await import('mermaid')
const mockRender = vi.mocked(mermaid.default.render)
const mockInitialize = vi.mocked(mermaid.default.initialize)

describe('MermaidDiagram Component', () => {
  const mockChart = `
    graph TD
      A[Start] --> B[End]
  `

  beforeEach(() => {
    vi.clearAllMocks()
    // Default successful render
    mockRender.mockResolvedValue({
      svg: '<svg data-testid="mermaid-svg"><rect /></svg>',
      diagramType: 'graph' as const,
    })
  })

  describe('Initialization', () => {
    it('initializes mermaid with correct configuration', async () => {
      render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalledWith({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 16,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
            padding: 20,
          },
          themeVariables: {
            fontSize: '16px',
          },
        })
      })
    })
  })

  describe('Successful Rendering', () => {
    it('renders the component container', () => {
      const { container } = render(<MermaidDiagram chart={mockChart} />)

      const diagramContainer = container.querySelector('.mermaid-container')
      expect(diagramContainer).toBeInTheDocument()
    })

    it('calls mermaid.render with chart data', async () => {
      render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledWith(expect.stringMatching(/^mermaid-/), mockChart)
      })
    })

    it('renders SVG with correct content', async () => {
      const { container } = render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        const svg = container.querySelector('[data-testid="mermaid-svg"]')
        expect(svg).toBeInTheDocument()
      })
    })

    it('generates unique ID for each diagram', async () => {
      render(<MermaidDiagram chart={mockChart} />)
      render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledTimes(2)
        const firstCallId = mockRender.mock.calls[0][0]
        const secondCallId = mockRender.mock.calls[1][0]
        expect(firstCallId).not.toBe(secondCallId)
      })
    })
  })

  describe('SVG Styling', () => {
    it('makes SVG responsive', async () => {
      mockRender.mockResolvedValue({
        svg: '<svg height="500" data-testid="mermaid-svg"><rect /></svg>',
        diagramType: 'graph' as const,
      })

      const { container } = render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        const svg = container.querySelector('[data-testid="mermaid-svg"]') as SVGElement
        expect(svg).toBeInTheDocument()
        expect(svg.style.width).toBe('100%')
        expect(svg.style.height).toBe('auto')
        expect(svg.style.maxWidth).toBe('100%')
        expect(svg.style.minHeight).toBe('400px')
        expect(svg.hasAttribute('height')).toBe(false)
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when rendering fails', async () => {
      const errorMessage = 'Invalid syntax in diagram'
      mockRender.mockRejectedValue(new Error(errorMessage))

      const { container } = render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        const errorDiv = container.querySelector('.border-red-200')
        expect(errorDiv).toBeInTheDocument()
        expect(errorDiv?.textContent).toContain('Error rendering diagram:')
        expect(errorDiv?.textContent).toContain(errorMessage)
      })
    })

    it('displays error for unknown error types', async () => {
      mockRender.mockRejectedValue('String error')

      const { container } = render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        const errorDiv = container.querySelector('.border-red-200')
        expect(errorDiv).toBeInTheDocument()
        expect(errorDiv?.textContent).toContain('Unknown error')
      })
    })

    it('logs error to console', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      mockRender.mockRejectedValue(error)

      render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Mermaid rendering error:', error)
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Re-rendering on Chart Change', () => {
    it('re-renders when chart prop changes', async () => {
      const { rerender } = render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledTimes(1)
      })

      const newChart = 'graph TD\nX --> Y'
      rerender(<MermaidDiagram chart={newChart} />)

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledTimes(2)
        expect(mockRender).toHaveBeenLastCalledWith(expect.any(String), newChart)
      })
    })

    it('clears previous content before re-rendering', async () => {
      const { container, rerender } = render(<MermaidDiagram chart={mockChart} />)

      await waitFor(() => {
        const firstSvg = container.querySelector('[data-testid="mermaid-svg"]')
        expect(firstSvg).toBeInTheDocument()
      })

      mockRender.mockResolvedValue({
        svg: '<svg data-testid="new-mermaid-svg"><circle /></svg>',
        diagramType: 'graph' as const,
      })

      rerender(<MermaidDiagram chart="graph TD\nNew --> Chart" />)

      await waitFor(() => {
        const oldSvg = container.querySelector('[data-testid="mermaid-svg"]')
        const newSvg = container.querySelector('[data-testid="new-mermaid-svg"]')
        expect(oldSvg).not.toBeInTheDocument()
        expect(newSvg).toBeInTheDocument()
      })
    })
  })

  describe('Container Styling', () => {
    it('has proper container classes', () => {
      const { container } = render(<MermaidDiagram chart={mockChart} />)

      const wrapper = container.querySelector('.my-8.overflow-x-auto.rounded-xl')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass(
        'my-8',
        'overflow-x-auto',
        'rounded-xl',
        'border',
        'border-slate-200',
      )
    })

    it('has minimum height style', () => {
      const { container } = render(<MermaidDiagram chart={mockChart} />)

      const diagramContainer = container.querySelector('.mermaid-container')
      expect(diagramContainer).toHaveStyle({ minHeight: '400px' })
    })

    it('has flex and justify-center classes on diagram container', () => {
      const { container } = render(<MermaidDiagram chart={mockChart} />)

      const diagramContainer = container.querySelector('.mermaid-container')
      expect(diagramContainer).toHaveClass('flex', 'justify-center')
    })
  })

  describe('Edge Cases', () => {
    it('handles empty chart string', async () => {
      render(<MermaidDiagram chart="" />)

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledWith(expect.any(String), '')
      })
    })

    it('handles very long chart definition', async () => {
      const longChart = 'graph TD\n' + 'A --> B\n'.repeat(100)
      render(<MermaidDiagram chart={longChart} />)

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledWith(expect.any(String), longChart)
      })
    })
  })
})
