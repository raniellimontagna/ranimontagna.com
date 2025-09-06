'use client'

import { motion, HTMLMotionProps, useInView } from 'motion/react'
import { ReactNode, useRef } from 'react'

interface MotionWrapperProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  triggerOnce?: boolean
}

export function MotionWrapper({
  children,
  delay = 0,
  duration = 0.6,
  className,
  triggerOnce = true,
  ...props
}: MotionWrapperProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: triggerOnce, margin: '0px 0px -100px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration,
        delay: isInView ? delay : 0,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
