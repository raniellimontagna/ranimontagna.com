import type { HTMLAttributes, ReactNode } from 'react'

interface StaggerContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  staggerDelay?: number
  className?: string
  triggerOnce?: boolean
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
  triggerOnce = true,
  ...props
}: StaggerContainerProps) {
  return (
    <div
      className={className}
      data-gsap-stagger="true"
      data-gsap-stagger-delay={staggerDelay}
      data-gsap-once={String(triggerOnce)}
      {...props}
    >
      {children}
    </div>
  )
}

interface StaggerItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className, ...props }: StaggerItemProps) {
  return (
    <div className={className} data-gsap-stagger-item="true" {...props}>
      {children}
    </div>
  )
}
