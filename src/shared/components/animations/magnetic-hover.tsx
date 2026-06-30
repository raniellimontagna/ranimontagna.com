import type { ReactNode } from 'react'

interface MagneticHoverProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function MagneticHover({ children, className, strength = 18 }: MagneticHoverProps) {
  return (
    <div className={className} data-gsap-magnetic="true" data-gsap-strength={strength}>
      {children}
    </div>
  )
}
