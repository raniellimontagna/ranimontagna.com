'use client'

import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { useEffect } from 'react'

interface TypingEffectProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  cursorColor?: string
}

export function TypingEffect({
  text,
  className,
  delay = 0,
  duration = 2, // Total duration to type the text
  cursorColor = 'bg-blue-500',
}: TypingEffectProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest))

  useEffect(() => {
    const controls = animate(count, text.length, {
      type: 'tween',
      duration: duration,
      ease: 'linear',
      delay: delay,
    })
    return controls.stop
  }, [count, delay, duration, text.length])

  return (
    <span className={className}>
      <motion.span>{displayText}</motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
          times: [0, 0.5, 1],
        }}
        className={`inline-block h-[1em] w-[2px] translate-y-[2px] ${cursorColor}`}
      />
    </span>
  )
}
