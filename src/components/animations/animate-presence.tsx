'use client'

import { motion, AnimatePresence } from 'motion/react'
import { ReactNode } from 'react'

interface AnimatedPresenceProps {
  children: ReactNode
  show: boolean
  mode?: 'wait' | 'sync' | 'popLayout'
  className?: string
}

export function AnimatedPresence({
  children,
  show,
  mode = 'wait',
  className,
}: AnimatedPresenceProps) {
  return (
    <AnimatePresence mode={mode}>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ModalPresence({ children, show, className }: AnimatedPresenceProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SlidePresence({
  children,
  show,
  direction = 'right',
  className,
}: AnimatedPresenceProps & { direction?: 'left' | 'right' | 'up' | 'down' }) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { x: -100 }
      case 'right':
        return { x: 100 }
      case 'up':
        return { y: -100 }
      case 'down':
        return { y: 100 }
      default:
        return { x: 100 }
    }
  }

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, ...getInitialPosition() }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, ...getInitialPosition() }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
