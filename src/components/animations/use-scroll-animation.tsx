'use client'

import { useInView } from 'motion/react'
import { useRef } from 'react'

interface UseScrollAnimationOptions {
  triggerOnce?: boolean
  threshold?: number
  delay?: number
}

export function useScrollAnimation({
  triggerOnce = true,
  threshold = 0.1,
  delay = 0,
}: UseScrollAnimationOptions = {}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: threshold,
  })

  const controls = {
    ref,
    isInView,
    animate: isInView ? 'visible' : 'hidden',
    initial: 'hidden',
    transition: {
      delay: isInView ? delay : 0,
    },
  }

  return controls
}

// Hook mais específico para animações de scroll com diferentes tipos
export function useScrollAnimationType(
  type: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate' = 'fadeIn',
  options: UseScrollAnimationOptions = {},
) {
  const controls = useScrollAnimation(options)

  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
    },
    slideRight: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10, scale: 0.9 },
      visible: { opacity: 1, rotate: 0, scale: 1 },
    },
  }

  return {
    ...controls,
    variants: variants[type],
  }
}
