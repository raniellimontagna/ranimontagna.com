import type { CSSProperties } from 'react'
import type { BrandIconName } from './brand-icons'

/** A decorative brand mark in currentColor. Size it with className. */
export function BrandIcon({ name, className }: { name: BrandIconName; className?: string }) {
  const url = `url(/brand-icons/${name}.svg)`
  const style: CSSProperties = {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  }

  return (
    <span
      aria-hidden="true"
      data-brand-icon={name}
      className={`inline-block shrink-0 bg-current ${className ?? ''}`.trim()}
      style={style}
    />
  )
}
