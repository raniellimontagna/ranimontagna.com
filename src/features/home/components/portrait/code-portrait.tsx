'use client'

import { getImageProps } from 'next/image'
import { useEffect, useRef } from 'react'
import { preload } from 'react-dom'
import { prefersReducedMotion } from '@/shared/components/motion'
import {
  buildGlyphGrid,
  CODE_GLYPHS,
  cellSizeFor,
  coverDestination,
  type GlyphCell,
  glyphFor,
} from './glyph-grid'

type CodePortraitProps = {
  src: string
  alt: string
  /** 0 shows only characters, 1 only the photo. */
  getReveal: () => number
}

const POINTER_RADIUS_SQ = 5200
const RANDOM_SWAP = 0.004
const BRIGHT_CELL = 0.78
const CROSSFADE_MS = 400
const MAX_DPR = 2
const OFF_CANVAS = -999

function readColors(canvas: HTMLCanvasElement) {
  const root = getComputedStyle(document.documentElement)
  const foreground =
    root.getPropertyValue('--foreground').trim() || getComputedStyle(canvas).color || 'white'
  const accent = root.getPropertyValue('--accent').trim() || foreground
  return { accent, foreground }
}

/**
 * The real photo, drawn as characters that turn into code near the pointer.
 * The <img> is the content: the canvas is decoration on top of it, and the
 * photo stays visible whenever the canvas cannot run.
 */
export function CodePortrait({ src, alt, getReveal }: CodePortraitProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const getRevealRef = useRef(getReveal)

  useEffect(() => {
    getRevealRef.current = getReveal
  }, [getReveal])

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!root || !canvas || !img || prefersReducedMotion()) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cells: GlyphCell[] = []
    let cell = cellSizeFor(window.innerWidth)
    let ready = false
    let builtSize = ''
    let visible = true
    let frame = 0
    let startedAt = 0
    let colors = readColors(canvas)
    let colorsStale = false
    const pointer = { x: OFF_CANVAS, y: OFF_CANVAS }
    const fontFamily = getComputedStyle(canvas).fontFamily || 'monospace'

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height || !img.naturalWidth) return

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const nextCell = cellSizeFor(window.innerWidth)
      // Phones fire resize when the URL bar collapses, mid-reveal. Rebuilding then would
      // re-roll every cell's dissolve threshold, so only rebuild when the grid changes.
      const size = `${Math.round(rect.width)}x${Math.round(rect.height)}@${dpr}/${nextCell.w}/${img.naturalWidth}x${img.naturalHeight}`
      if (ready && size === builtSize) return
      builtSize = size

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cell = nextCell
      const cols = Math.ceil(rect.width / cell.w)
      const rows = Math.ceil(rect.height / cell.h)
      const sample = document.createElement('canvas')
      sample.width = cols
      sample.height = rows
      const sampleCtx = sample.getContext('2d')
      if (!sampleCtx) return

      const dest = coverDestination(img.naturalWidth, img.naturalHeight, cols, rows)
      sampleCtx.drawImage(img, dest.dx, dest.dy, dest.dw, dest.dh)
      cells = buildGlyphGrid(sampleCtx.getImageData(0, 0, cols, rows).data, cols, rows)

      if (!ready) startedAt = performance.now()
      ready = true
    }

    const draw = () => {
      if (colorsStale) {
        colors = readColors(canvas)
        colorsStale = false
      }

      const reveal = getRevealRef.current()
      const fadeIn = Math.min(1, (performance.now() - startedAt) / CROSSFADE_MS)
      img.style.opacity = String(Math.max(Math.min(1, reveal * 1.6), 1 - fadeIn))

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `600 ${cell.w * 1.25}px ${fontFamily}`
      ctx.textBaseline = 'top'

      for (const c of cells) {
        if (c.t < reveal * 1.15) continue

        const px = c.x * cell.w
        const py = c.y * cell.h
        const dx = px - pointer.x
        const dy = py - pointer.y
        const near = dx * dx + dy * dy < POINTER_RADIUS_SQ
        const swap = near || Math.random() < RANDOM_SWAP
        const ch = swap
          ? CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)]
          : glyphFor(c.l)
        if (ch === ' ') continue

        ctx.globalAlpha = (0.35 + c.l * 0.65) * fadeIn
        ctx.fillStyle = near || c.l > BRIGHT_CELL ? colors.accent : colors.foreground
        ctx.fillText(ch, px, py)
      }
      ctx.globalAlpha = 1
    }

    const loop = () => {
      frame = 0
      if (!visible) return
      if (ready) draw()
      frame = requestAnimationFrame(loop)
    }

    const start = () => {
      if (!frame && visible) frame = requestAnimationFrame(loop)
    }

    const onLoad = () => {
      build()
      start()
    }
    const onResize = () => {
      if (ready) build()
    }
    const setPointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = clientX - rect.left
      pointer.y = clientY - rect.top
    }
    const onPointerMove = (event: PointerEvent) => setPointer(event.clientX, event.clientY)
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (touch) setPointer(touch.clientX, touch.clientY)
    }
    const onPointerLeave = () => {
      pointer.x = OFF_CANVAS
      pointer.y = OFF_CANVAS
    }

    const visibility = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
      if (visible && ready) start()
    })
    visibility.observe(canvas)

    // Only a real theme change re-reads the colors: Lenis toggles classes on
    // <html> at every scroll start and stop.
    const themeOf = (classes: string | null) => /\b(light|dark)\b/.exec(classes ?? '')?.[1]
    const theme = new MutationObserver((records) => {
      for (const record of records) {
        if (
          record.attributeName === 'data-color-theme' ||
          themeOf(record.oldValue) !== themeOf(document.documentElement.className)
        ) {
          colorsStale = true
        }
      }
    })
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-color-theme'],
      attributeOldValue: true,
    })

    img.addEventListener('load', onLoad)
    window.addEventListener('resize', onResize)
    root.addEventListener('pointermove', onPointerMove)
    root.addEventListener('pointerleave', onPointerLeave)
    root.addEventListener('touchmove', onTouchMove, { passive: true })

    if (img.complete && img.naturalWidth > 0) onLoad()

    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
      theme.disconnect()
      img.removeEventListener('load', onLoad)
      window.removeEventListener('resize', onResize)
      root.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', onPointerLeave)
      root.removeEventListener('touchmove', onTouchMove)
      img.style.opacity = ''
    }
  }, [])

  const { props: imageProps } = getImageProps({
    src,
    alt,
    fill: true,
    priority: true,
    sizes: '(max-width: 760px) 100vw, 50vw',
  })

  preload(imageProps.src, {
    as: 'image',
    imageSrcSet: imageProps.srcSet,
    imageSizes: imageProps.sizes,
    fetchPriority: 'high',
  })

  return (
    <div
      ref={rootRef}
      data-testid="code-portrait"
      className="relative h-full w-full overflow-hidden"
    >
      {/* biome-ignore lint/performance/noImgElement: the canvas samples this exact element. */}
      <img {...imageProps} ref={imgRef} alt={alt} className="object-cover object-[50%_20%]" />
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: decorative canvas with no tabindex; the img carries the content. */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full font-mono"
      />
    </div>
  )
}
