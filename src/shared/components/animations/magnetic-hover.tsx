'use client'

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { type MouseEvent, type ReactNode, useRef } from 'react'

interface MagneticHoverProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function MagneticHover({ children, className, strength = 18 }: MagneticHoverProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 180, damping: 18, mass: 0.2 })
  const y = useSpring(rawY, { stiffness: 180, damping: 18, mass: 0.2 })

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) {
      return
    }

    const bounds = ref.current.getBoundingClientRect()
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5

    rawX.set(relativeX * strength)
    rawY.set(relativeY * strength)
  }

  const handlePointerLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={prefersReducedMotion ? undefined : { x, y, willChange: 'transform' }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      {children}
    </motion.div>
  )
}
