import type { useTranslations } from 'next-intl'

export const experiences = (t: ReturnType<typeof useTranslations>) => [
  {
    company: t('jobs.luizalabs.company'),
    position: t('jobs.luizalabs.position'),
    period: t('jobs.luizalabs.period'),
    location: t('jobs.luizalabs.location'),
    logo: '/companies/luizalabs.webp',
    description: t('jobs.luizalabs.description'),
    highlights: t.raw('jobs.luizalabs.highlights') as string[],
    technologies: ['React', 'React Native', 'Node.js', 'Go', 'APIs REST'],
    current: true,
  },
  {
    company: t('jobs.smarten.company'),
    position: t('jobs.smarten.position'),
    period: t('jobs.smarten.period'),
    location: t('jobs.smarten.location'),
    logo: '/companies/smarten.webp',
    description: t('jobs.smarten.description'),
    highlights: t.raw('jobs.smarten.highlights') as string[],
    technologies: ['JavaScript', 'React', 'Design System', 'CI/CD', 'Monitoramento'],
    current: false,
  },
  {
    company: t('jobs.sbsistemas.company'),
    position: t('jobs.sbsistemas.position'),
    period: t('jobs.sbsistemas.period'),
    location: t('jobs.sbsistemas.location'),
    logo: '/companies/sbsistemas.svg',
    description: t('jobs.sbsistemas.description'),
    highlights: t.raw('jobs.sbsistemas.highlights') as string[],
    technologies: ['React', 'Electron', 'TypeScript', 'JavaScript', 'Front-end'],
    current: false,
  },
]
