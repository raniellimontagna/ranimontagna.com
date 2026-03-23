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
        hidden: {
          opacity: prefersReducedMotion ? 1 : 0,
          y: prefersReducedMotion ? 0 : 24,
          filter: prefersReducedMotion ? 'blur(0px)' : 'blur(8px)',
        },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: {
            duration: prefersReducedMotion ? 0 : 0.7,
            ease: [0.19, 1, 0.22, 1],
          },
        },
      }}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity, filter' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
