'use client'

import { motion, HTMLMotionProps } from 'motion/react'
import { ReactNode } from 'react'

interface MotionWrapperProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function MotionWrapper({
  children,
  delay = 0,
  duration = 0.6,
  className,
  ...props
}: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
