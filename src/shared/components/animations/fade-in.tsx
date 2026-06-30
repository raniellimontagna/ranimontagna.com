import type { HTMLAttributes, ReactNode } from 'react'

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  className?: string
  triggerOnce?: boolean
  blur?: boolean
  scale?: boolean
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 20,
  className,
  triggerOnce = true,
  blur = false,
  scale = false,
  ...props
}: FadeInProps) {
  return (
    <div
      className={className}
      data-gsap-reveal="true"
      data-gsap-direction={direction}
      data-gsap-distance={distance}
      data-gsap-delay={delay}
      data-gsap-duration={duration}
      data-gsap-once={String(triggerOnce)}
      data-gsap-blur={blur ? 'true' : undefined}
      data-gsap-scale={scale ? 'true' : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
