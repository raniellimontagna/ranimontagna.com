import type { ComponentType, SVGProps } from 'react'

export interface ServiceType {
  id: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  features: string[]
  category: 'web' | 'mobile' | 'consulting' | 'optimization' | 'backend' | 'ai'
  popular?: boolean
}
