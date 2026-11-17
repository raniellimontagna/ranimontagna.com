'use client'

import { type PointerEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { XpIcon, type XpIconKind } from './xp-icons'

type XpWindowProps = {
  title: string
  icon: XpIconKind
  /** Stacking order: the focused window has the highest. */
  z: number
  /** Where it first opens, offset so new windows cascade. */
  offset: number
  focused: boolean
  minimized: boolean
  width?: number
  labels: { minimize: string; close: string }
  onFocus: () => void
  onMinimize: () => void
  onClose: () => void
  children: ReactNode
}

const MOBILE = '(max-width: 640px)'

/**
 * A window you can drag by its title bar (not on phones, where it fills the
 * screen), bring to the front, minimize to the taskbar and close with Escape.
 */
export function XpWindow({
  title,
  icon,
  z,
  offset,
  focused,
  minimized,
  width = 440,
  labels,
  onFocus,
  onMinimize,
  onClose,
  children,
}: XpWindowProps) {
  const titleId = useId()
  const frame = useRef<HTMLElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (window.matchMedia?.(MOBILE).matches) return
    // Cascade from the middle of the screen, like new windows used to.
    const x = Math.max(
      12,
      Math.min(window.innerWidth - width - 12, (window.innerWidth - width) / 2 - 60 + offset * 30),
    )
    const y = Math.max(12, Math.min(window.innerHeight - 380, 110 + offset * 28))
    setPosition({ x, y })
  }, [offset, width])

  useEffect(() => {
    frame.current
      ?.querySelector<HTMLElement>(
        '[data-xp-autofocus], a, button:not([data-xp-titlebutton]), input, textarea',
      )
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
    const rect = frame.current?.getBoundingClientRect()
    const w = rect?.width ?? width
    setPosition({
      x: Math.max(-w + 80, Math.min(window.innerWidth - 80, event.clientX - drag.current.dx)),
      y: Math.max(0, Math.min(window.innerHeight - 90, event.clientY - drag.current.dy)),
    })
  }

  return (
    <section
      ref={frame}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="xp-window"
      data-focused={focused || undefined}
      hidden={minimized}
      style={{
        zIndex: z,
        width,
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
        className="xp-window-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
      >
        <XpIcon kind={icon} size={18} />
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          data-xp-titlebutton
          className="xp-titlebutton"
          aria-label={labels.minimize}
          onClick={onMinimize}
        >
          <span aria-hidden="true">_</span>
        </button>
        <button
          type="button"
          data-xp-titlebutton
          className="xp-titlebutton xp-titlebutton-close"
          aria-label={labels.close}
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="xp-window-body">{children}</div>
    </section>
  )
}
