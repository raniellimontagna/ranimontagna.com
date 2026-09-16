import { Cpu, Global, Smartphone, StarFall } from '@solar-icons/react/ssr'
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
