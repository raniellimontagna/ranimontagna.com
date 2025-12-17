import { Globe, Settings, Smartphone, Zap } from 'lucide-react'
import type { ServiceType } from './services.types'

export const servicesData: Omit<ServiceType, 'title' | 'description' | 'features'>[] = [
  {
    id: 'web-development',
    icon: Globe,
    category: 'web',
    popular: true,
  },
  {
    id: 'mobile-development',
    icon: Smartphone,
    category: 'mobile',
  },
  {
    id: 'performance-optimization',
    icon: Zap,
    category: 'optimization',
  },
  {
    id: 'technical-consulting',
    icon: Settings,
    category: 'consulting',
  },
]
