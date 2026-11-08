import type { BrandIconName } from '@/shared/ui-2026'

export type StageId = 'sbsistemas' | 'smarten' | 'luizalabs' | 'lemon'

export type Stage = {
  id: StageId
  year: string
  /** Brand color and the white-on-transparent logo; ratio = logo width / height. */
  company: { name: string; color: string; logo: string; ratio: number }
  panelIcons: readonly BrandIconName[]
  stack: readonly string[]
}

/**
 * Oldest first. Atto is not here: it is Ranielli's own company and has its own
 * section. Brand colors are data taken from each logo, not theme tokens.
 */
export const STAGES: readonly Stage[] = [
  {
    id: 'sbsistemas',
    year: '2021',
    company: {
      name: 'SBSistemas',
      color: '#045ba8',
      logo: '/companies/white/sbsistemas.svg',
      ratio: 1,
    },
    panelIcons: ['react', 'electron', 'typescript'],
    stack: ['React', 'Electron', 'TypeScript'],
  },
  {
    id: 'smarten',
    year: '2022',
    company: { name: 'Smarten', color: '#6a14d6', logo: '/companies/white/smarten.png', ratio: 1 },
    panelIcons: ['react'],
    stack: ['React', 'Design System', 'CI/CD'],
  },
  {
    id: 'luizalabs',
    year: '2023',
    company: {
      name: 'Luizalabs',
      color: '#0f9bff',
      logo: '/companies/white/luizalabs.png',
      ratio: 4.052,
    },
    panelIcons: ['go', 'react', 'nodedotjs', 'googlecloud'],
    stack: [
      'React',
      'React Native',
      'Go',
      'Node.js',
      'TypeScript',
      'GCP',
      'RabbitMQ',
      'SonarQube',
      'Grafana',
    ],
  },
  {
    id: 'lemon',
    year: '2026',
    company: {
      name: 'Lemon Energia',
      color: '#003c00',
      logo: '/companies/white/lemon.png',
      ratio: 3.782,
    },
    panelIcons: ['aws', 'fastify', 'postgresql', 'pulumi'],
    stack: [
      'React',
      'TypeScript',
      'Fastify',
      'PostgreSQL',
      'Pulumi',
      'ECS Fargate',
      'Aurora (RDS)',
      'EventBridge',
      'SQS',
      'API Gateway',
      'IA',
    ],
  },
]

/** Text on the strip: white where it reads on a brand color (4.5:1), dark ink where not. */
export const STRIP_INK = { light: '#ffffff', dark: '#070b0c' } as const
