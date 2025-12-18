import { Bot, Database, Globe, Smartphone } from 'lucide-react'
import type { ServiceType } from './services.types'

export const servicesData: Omit<ServiceType, 'title' | 'description' | 'features'>[] = [
  {
    id: 'web-development',
    icon: Globe,
    category: 'web',
    popular: true,
  },
  {
    id: 'api-development',
    icon: Database,
    category: 'backend',
  },
  {
    id: 'ai-integration',
    icon: Bot,
    category: 'ai',
    popular: true,
  },
  {
    id: 'mobile-development',
    icon: Smartphone,
    category: 'mobile',
  },
]
