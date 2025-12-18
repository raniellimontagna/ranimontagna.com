'use client'

import { type HTMLMotionProps, motion, useInView } from 'motion/react'
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
  const isInView = useInView(ref, { once: triggerOnce, margin: '0px 0px -50px 0px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      style={{ willChange: 'opacity' }}
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
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      }}
      style={{ willChange: 'transform, opacity' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
