'use client'

import { motion, useInView, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'

interface CountUpProps {
  value: number
  suffix?: string
  className?: string
  duration?: number
  delay?: number
}

export function CountUp({
  value,
  suffix = '',
  className,
  duration = 1.6,
  delay = 0,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const prefersReducedMotion = useReducedMotion()

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 30,
    duration: prefersReducedMotion ? 0 : duration,
  })

  const display = useTransform(
    spring,
    (latest) => `${String(Math.round(latest)).padStart(2, '0')}${suffix}`,
  )

  useEffect(() => {
    if (!isInView) return
    const timer = setTimeout(() => spring.set(value), prefersReducedMotion ? 0 : delay * 1000)
    return () => clearTimeout(timer)
  }, [isInView, spring, value, delay, prefersReducedMotion])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}
