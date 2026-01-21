'use client'

import mermaid from 'mermaid'
import { useEffect, useRef } from 'react'

interface MermaidDiagramProps {
  chart: string
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize mermaid with configuration
    mermaid.initialize({
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

    const renderDiagram = async () => {
      if (!containerRef.current) return

      try {
        // Clear previous content
        containerRef.current.innerHTML = ''

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg } = await mermaid.render(id, chart)

        // Insert the SVG
        containerRef.current.innerHTML = svg

        // Adjust SVG to be responsive and larger
        const svgElement = containerRef.current.querySelector('svg')
        if (svgElement) {
          svgElement.removeAttribute('height')
          svgElement.style.width = '100%'
          svgElement.style.height = 'auto'
          svgElement.style.maxWidth = '100%'
          // Increase minimum height for better visibility
          svgElement.style.minHeight = '400px'
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        containerRef.current.innerHTML = `
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <strong>Error rendering diagram:</strong>
            <pre class="mt-2 overflow-x-auto text-xs">${error instanceof Error ? error.message : 'Unknown error'}</pre>
          </div>
        `
      }
    }

    renderDiagram()
  }, [chart])

  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div
        ref={containerRef}
        className="mermaid-container flex justify-center"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}
