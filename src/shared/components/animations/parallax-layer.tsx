import type { ReactNode } from 'react'

interface ParallaxLayerProps {
  children?: ReactNode
  className?: string
  offset?: number
  axis?: 'x' | 'y'
}

export function ParallaxLayer({
  children,
  className,
  offset = 36,
  axis = 'y',
}: ParallaxLayerProps) {
  let safeClassName = 'relative'

  if (className) {
    const hasPosition = ['absolute', 'fixed', 'relative'].some((pos) => className.includes(pos))
    safeClassName = hasPosition ? className : `relative ${className}`
  }

  return (
    <div
      className={safeClassName}
      data-gsap-parallax="true"
      data-gsap-axis={axis}
      data-gsap-offset={offset}
    >
      {children}
    </div>
  )
}
