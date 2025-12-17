'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'

interface InfiniteMarqueeProps {
  children: React.ReactNode
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow'
  className?: string
  pauseOnHover?: boolean
}

export function InfiniteMarquee({
  children,
  direction = 'left',
  speed = 'normal',
  className,
  pauseOnHover = true,
}: InfiniteMarqueeProps) {
  const [isPaused, setIsPaused] = useState(false)

  const duration = {
    fast: 20,
    normal: 40,
    slow: 60,
  }[speed]

  const animationStyle: React.CSSProperties = {
    animation: `marquee-scroll ${duration}s linear infinite`,
    animationDirection: direction === 'left' ? 'normal' : 'reverse',
    animationPlayState: isPaused ? 'paused' : 'running',
  }

  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Mouse events are for visual effect only */}
      <div
        role="presentation"
        className={cn('flex overflow-hidden', className)}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        <div className="flex shrink-0 items-center gap-4" style={animationStyle}>
          {children}
          {children}
        </div>
      </div>
    </>
  )
}
