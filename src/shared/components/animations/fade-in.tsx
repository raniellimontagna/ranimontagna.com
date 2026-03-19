'use client'

import { type HTMLMotionProps, motion, useInView, useReducedMotion } from 'motion/react'
import { type ReactNode, useRef } from 'react'

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  className?: string
  triggerOnce?: boolean
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 20,
  className,
  triggerOnce = true,
  ...props
}: FadeInProps) {
  const ref = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const isInView = useInView(ref, { once: triggerOnce, margin: '0px 0px -100px 0px' })

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: distance }
      case 'down':
        return { y: -distance }
      case 'left':
        return { x: distance }
      case 'right':
        return { x: -distance }
      case 'none':
        return {}
      default:
        return { y: distance }
    }
  }

  const initialConfig = prefersReducedMotion
    ? { opacity: 1, y: 0, x: 0 }
    : { opacity: 0, ...getInitialPosition() }
  const animateConfig = prefersReducedMotion
    ? { opacity: 1, y: 0, x: 0 }
    : isInView
      ? { opacity: 1, y: 0, x: 0 }
      : { opacity: 0, ...getInitialPosition() }

  return (
    <motion.div
      ref={ref}
      initial={initialConfig}
      animate={animateConfig}
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: isInView && !prefersReducedMotion ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={{ willChange: prefersReducedMotion ? 'auto' : 'transform, opacity' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
