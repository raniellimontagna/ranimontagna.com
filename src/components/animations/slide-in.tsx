'use client'

import { motion, HTMLMotionProps } from 'motion/react'
import { ReactNode } from 'react'

interface SlideInProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  className?: string
}

export function SlideIn({
  children,
  delay = 0,
  duration = 0.8,
  direction = 'up',
  distance = 50,
  className,
  ...props
}: SlideInProps) {
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
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.175, 0.885, 0.32, 1.275], // easeOutBack
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
