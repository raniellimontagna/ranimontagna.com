'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { type ReactNode, useRef } from 'react'

interface BlurRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  once?: boolean
}

export function BlurReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  once = true,
}: BlurRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once, margin: '0px 0px -80px 0px' })
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={
        prefersReducedMotion
          ? { opacity: 1 }
          : { opacity: 0, filter: 'blur(16px)', y: 30, scale: 0.97 }
      }
      animate={
        prefersReducedMotion
          ? { opacity: 1 }
          : isInView
            ? { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }
            : undefined
      }
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: isInView && !prefersReducedMotion ? delay : 0,
        ease: [0.19, 1, 0.22, 1],
      }}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  )
}
