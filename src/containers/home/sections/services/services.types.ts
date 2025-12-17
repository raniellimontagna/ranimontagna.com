import type { LucideIcon } from 'lucide-react'

export interface ServiceType {
  id: string
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  category: 'web' | 'mobile' | 'consulting' | 'optimization'
  popular?: boolean
}

export interface ServiceCardProps {
  service: ServiceType
  animationDelay?: string
}
