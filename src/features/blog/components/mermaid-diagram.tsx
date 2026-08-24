'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

type MermaidApi = typeof import('mermaid').default
type MermaidLoader = () => Promise<MermaidApi>

const loadDefaultMermaid: MermaidLoader = async () => (await import('mermaid')).default

interface MermaidDiagramProps {
  chart: string
  loadMermaid?: MermaidLoader
}

export function MermaidDiagram({ chart, loadMermaid = loadDefaultMermaid }: MermaidDiagramProps) {
  const t = useTranslations('blog')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    if (typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNearViewport(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isNearViewport || !containerRef.current) return
    let cancelled = false

    const renderDiagram = async () => {
      setStatus('loading')
      try {
        const mermaid = await loadMermaid()
        if (cancelled || !containerRef.current) return
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'strict',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 16,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: false,
            curve: reducedMotion ? 'linear' : 'basis',
            padding: 20,
          },
          themeVariables: { fontSize: '16px' },
        })

        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
        const { svg } = await mermaid.render(id, chart)
        if (cancelled || !containerRef.current) return
        containerRef.current.innerHTML = svg

        const svgElement = containerRef.current.querySelector('svg')
        if (svgElement) {
          svgElement.removeAttribute('height')
          svgElement.style.width = '100%'
          svgElement.style.height = 'auto'
          svgElement.style.maxWidth = '100%'
          svgElement.style.minHeight = '400px'
        }
        setStatus('ready')
      } catch (error) {
        if (cancelled) return
        console.error('Mermaid rendering error:', error)
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
        setStatus('error')
      }
    }

    containerRef.current.replaceChildren()
    void renderDiagram()
    return () => {
      cancelled = true
    }
  }, [chart, isNearViewport, loadMermaid])

  return (
    <div
      ref={wrapperRef}
      className="my-8 overflow-x-auto rounded-xl border border-line bg-surface p-6"
    >
      {status !== 'ready' && status !== 'error' && (
        <p role="status" className="mb-3 text-center text-sm text-muted">
          {status === 'loading' ? t('diagramLoading') : t('diagramPending')}
        </p>
      )}
      {status === 'error' && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <strong>{t('diagramError')}</strong>
          <pre className="mt-2 overflow-x-auto text-xs">{errorMessage}</pre>
        </div>
      )}
      <div
        ref={containerRef}
        className="mermaid-container flex justify-center"
        style={{ minHeight: '400px' }}
        aria-hidden={status !== 'ready'}
      />
    </div>
  )
}
