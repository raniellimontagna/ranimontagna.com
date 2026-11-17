'use client'

import { type PointerEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'

const MOBILE = '(max-width: 640px)'

/**
 * A striped-title window: drag it by the title, click to bring it forward,
 * the close box (left) or Escape closes it, the zoom box (right) widens it.
 */
export function MacWindow({
  title,
  z,
  offset,
  focused,
  width = 420,
  labels,
  onFocus,
  onClose,
  children,
}: {
  title: string
  z: number
  offset: number
  focused: boolean
  width?: number
  labels: { close: string; zoom: string }
  onFocus: () => void
  onClose: () => void
  children: ReactNode
}) {
  const titleId = useId()
  const frame = useRef<HTMLElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (window.matchMedia?.(MOBILE).matches) return
    const x = Math.max(12, Math.min(window.innerWidth - width - 12, 120 + offset * 34))
    const y = Math.max(40, Math.min(window.innerHeight - 320, 80 + offset * 30))
    setPosition({ x, y })
  }, [offset, width])

  useEffect(() => {
    frame.current
      ?.querySelector<HTMLElement>('[data-mac-autofocus], a, button:not([data-mac-box])')
      ?.focus({ preventScroll: true })
  }, [])

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !position || window.matchMedia?.(MOBILE).matches) return
    if ((event.target as HTMLElement).closest('button')) return
    drag.current = { dx: event.clientX - position.x, dy: event.clientY - position.y }
    event.currentTarget.setPointerCapture(event.pointerId)
    onFocus()
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    setPosition({
      x: Math.max(-width + 80, Math.min(window.innerWidth - 80, event.clientX - drag.current.dx)),
      y: Math.max(28, Math.min(window.innerHeight - 80, event.clientY - drag.current.dy)),
    })
  }

  return (
    <section
      ref={frame}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="mac-window"
      data-focused={focused || undefined}
      data-zoomed={zoomed || undefined}
      style={{
        zIndex: z,
        width: zoomed ? Math.min(width * 1.45, 760) : width,
        ...(position ? { left: position.x, top: position.y } : {}),
      }}
      onPointerDownCapture={onFocus}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          onClose()
        }
      }}
    >
      <div
        className="mac-window-bar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
      >
        <button
          type="button"
          data-mac-box
          className="mac-box"
          aria-label={labels.close}
          onClick={onClose}
        />
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          data-mac-box
          className="mac-box mac-box-zoom"
          aria-label={labels.zoom}
          aria-pressed={zoomed}
          onClick={() => setZoomed((value) => !value)}
        />
      </div>
      <div className="mac-window-body">{children}</div>
    </section>
  )
}
