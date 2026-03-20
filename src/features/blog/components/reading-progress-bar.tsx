'use client'

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'

export function ReadingProgressBar() {
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  if (scaleX.get() < 0.001) return null

  return (
    <div className="fixed top-0 right-0 left-0 z-60 h-1.5 bg-transparent">
      <motion.div
        className="h-full origin-left bg-linear-to-r from-accent-ice to-accent"
        style={prefersReducedMotion ? undefined : { scaleX }}
      />
    </div>
  )
}
