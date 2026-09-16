import type { ComponentType, SVGProps } from 'react'

export interface ServiceType {
  id: 'web' | 'mobile' | 'ai' | 'marketing'
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
}
