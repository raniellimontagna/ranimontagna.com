'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { type ReactNode, useRef } from 'react'

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
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const movement = useTransform(scrollYProgress, [0, 1], [-offset, offset])
  const style = prefersReducedMotion
    ? undefined
    : axis === 'x'
      ? { x: movement, willChange: 'transform' as const }
      : { y: movement, willChange: 'transform' as const }

  let safeClassName = 'relative'
  
  if (className) {
    const hasPosition = ['absolute', 'fixed', 'relative'].some(pos => className.includes(pos))
    safeClassName = hasPosition ? className : `relative ${className}`
  }

  return (
    <motion.div ref={ref} className={safeClassName} style={style}>
      {children}
    </motion.div>
  )
}
