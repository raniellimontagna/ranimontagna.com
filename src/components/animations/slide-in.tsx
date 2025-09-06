'use client'

import { motion } from 'motion/react'
import { useInView } from 'motion/react'
import { useRef, useEffect, useState } from 'react'

interface SlideInProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  duration?: number
  delay?: number
  triggerOnce?: boolean
  className?: string
}

export function SlideIn({
  children,
  direction = 'up',
  distance = 100,
  duration = 0.8,
  delay = 0,
  triggerOnce = true,
  className = '',
}: SlideInProps) {
  const ref = useRef(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isInViewRaw = useInView(ref, {
    once: triggerOnce,
    amount: 0.1,
  })

  const isInView =
    !isMounted || typeof window === 'undefined' || !('IntersectionObserver' in window)
      ? true
      : isInViewRaw

  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { x: 0, y: distance }
      case 'down':
        return { x: 0, y: -distance }
      case 'left':
        return { x: distance, y: 0 }
      case 'right':
        return { x: -distance, y: 0 }
      default:
        return { x: 0, y: distance }
    }
  }

  const variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      ...getInitialPosition(),
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}
