'use client'

import { type HTMLMotionProps, motion, useInView, useReducedMotion } from 'motion/react'
import { type ReactNode, useRef } from 'react'

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  staggerDelay?: number
  className?: string
  triggerOnce?: boolean
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
  triggerOnce = true,
  ...props
}: StaggerContainerProps) {
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const isInView = useInView(ref, { once: triggerOnce, margin: '0px 0px -50px 0px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView || prefersReducedMotion ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: prefersReducedMotion ? 1 : 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
          },
        },
      }}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'opacity' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.div
      variants={{
        hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
