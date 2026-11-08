'use client'

import { useEffect, useState } from 'react'

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * "02 / 06" under a swipe carousel. The position comes from the list's
 * scrollLeft over one step (item width plus gap); at the end of the scroll it
 * reads the last item, since the last cards can never snap to the start.
 */
export function SnapCounter({
  targetSelector,
  total,
  className = '',
}: {
  targetSelector: string
  total: number
  className?: string
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const target = document.querySelector<HTMLElement>(targetSelector)
    if (!target) return

    const update = () => {
      const first = target.firstElementChild as HTMLElement | null
      const second = first?.nextElementSibling as HTMLElement | null
      const step =
        (first && second && second.offsetLeft - first.offsetLeft) ||
        first?.offsetWidth ||
        target.clientWidth
      const overflow = target.scrollWidth - target.clientWidth
      const atEnd = overflow > 1 && target.scrollLeft >= overflow - 2
      const position = step > 0 ? Math.round(target.scrollLeft / step) : 0
      setIndex(atEnd ? total - 1 : Math.min(Math.max(position, 0), total - 1))
    }

    update()
    target.addEventListener('scroll', update, { passive: true })
    return () => target.removeEventListener('scroll', update)
  }, [targetSelector, total])

  return (
    <p
      data-snap-counter
      aria-hidden="true"
      className={`font-mono text-xs tracking-[0.14em] text-muted tabular-nums ${className}`}
    >
      <span className="text-foreground">{pad(index + 1)}</span> / {pad(total)}
    </p>
  )
}
