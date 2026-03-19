'use client'

import { motion, useInView, useReducedMotion } from 'motion/react'
import { useMemo, useRef } from 'react'
import { cn } from '@/shared/lib/utils'

interface RevealTextProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  mode?: 'word' | 'char'
  once?: boolean
}

export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  mode = 'word',
  once = true,
}: RevealTextProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const isInView = useInView(ref, { once, margin: '0px 0px -80px 0px' })
  const prefersReducedMotion = useReducedMotion()

  const segments = useMemo(() => {
    if (mode === 'char') {
      return Array.from(text).map((segment) => (segment === ' ' ? '\u00A0' : segment))
    }

    return text.split(' ')
  }, [mode, text])

  return (
    <span
      ref={ref}
      className={cn(
        mode === 'word' ? 'inline-flex flex-wrap gap-x-[0.28em]' : 'inline-flex flex-wrap',
        className,
      )}
    >
      {segments.map((segment, index) => (
        <span key={`${segment}-${index}`} className="overflow-hidden py-[0.15em]">
          <motion.span
            className={mode === 'char' ? 'inline-block whitespace-pre' : 'inline-block'}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: '112%' }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 0.7,
              delay: delay + index * stagger,
              ease: [0.19, 1, 0.22, 1],
            }}
            style={{ willChange: 'transform, opacity' }}
          >
            {segment}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
