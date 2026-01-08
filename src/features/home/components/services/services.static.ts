import { Cpu, Database, Global, Smartphone } from '@solar-icons/react/ssr'
import type { ServiceType } from './services.types'

export const servicesData: Omit<ServiceType, 'title' | 'description' | 'features'>[] = [
  {
    id: 'web-development',
    icon: Global,
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
    icon: Cpu,
    category: 'ai',
    popular: true,
  },
  {
    id: 'mobile-development',
    icon: Smartphone,
    category: 'mobile',
  },
]
