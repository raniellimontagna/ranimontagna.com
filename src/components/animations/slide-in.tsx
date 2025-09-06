'use client'

import { motion, HTMLMotionProps, useInView } from 'motion/react'
import { ReactNode, useRef } from 'react'

interface SlideInProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  className?: string
  triggerOnce?: boolean
}

export function SlideIn({
  children,
  delay = 0,
  duration = 0.8,
  direction = 'up',
  distance = 50,
  className,
  triggerOnce = true,
  ...props
}: SlideInProps) {
  const ref = useRef(null)
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
      default:
        return { y: distance }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, ...getInitialPosition() }}
      transition={{
        duration,
        delay: isInView ? delay : 0,
        ease: [0.175, 0.885, 0.32, 1.275], // easeOutBack
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
