import {
  CpuIcon as Cpu,
  GlobalIcon as Global,
  SmartphoneIcon as Smartphone,
  StarFallIcon as StarFall,
} from '@solar-icons/react/linear'
import type { ServiceType } from './services.types'

/** Frentes da Atto exibidas na ponte do site pessoal. Textos em messages/*.json (services.list). */
export const servicesData: Omit<ServiceType, 'title' | 'description'>[] = [
  { id: 'web', icon: Global },
  { id: 'mobile', icon: Smartphone },
  { id: 'ai', icon: Cpu },
  { id: 'marketing', icon: StarFall },
]

export const ATTO_URL = 'https://attodev.com.br'
export const ATTO_CASES_URL = 'https://attodev.com.br/#cases'
