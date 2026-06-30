import type { ReactNode } from 'react'

interface BlurRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  once?: boolean
}

export function BlurReveal({
  children,
  className,
  delay = 0,
  duration = 0.9,
  once = true,
}: BlurRevealProps) {
  return (
    <div
      className={className}
      data-gsap-reveal="true"
      data-gsap-direction="none"
      data-gsap-distance="0"
      data-gsap-delay={delay}
      data-gsap-duration={duration}
      data-gsap-once={String(once)}
      data-gsap-blur="true"
      data-gsap-scale="true"
    >
      {children}
    </div>
  )
}
