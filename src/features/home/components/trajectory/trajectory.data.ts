export type StageId = 'sbsistemas' | 'smarten' | 'luizalabs' | 'lemon-atto'

export type StageLogo =
  | { kind: 'image'; src: string; alt: string; width: number; height: number }
  | { kind: 'atto' }

export type Stage = {
  id: StageId
  year: string
  logos: readonly StageLogo[]
  photo: { src: string }
  stack: readonly string[]
}

/** Oldest first. Photos are real; one repeats until the new photo session arrives. */
export const STAGES: readonly Stage[] = [
  {
    id: 'sbsistemas',
    year: '2021',
    logos: [
      {
        kind: 'image',
        src: '/companies/sbsistemas.svg',
        alt: 'SBSistemas',
        width: 160,
        height: 48,
      },
    ],
    photo: { src: '/images/pc-avatar.webp' },
    stack: ['React', 'Electron', 'TypeScript'],
  },
  {
    id: 'smarten',
    year: '2022',
    logos: [
      { kind: 'image', src: '/companies/smarten.webp', alt: 'Smarten', width: 160, height: 48 },
    ],
    photo: { src: '/images/about-ranielli.webp' },
    stack: ['React', 'Design System', 'CI/CD'],
  },
  {
    id: 'luizalabs',
    year: '2023',
    logos: [
      { kind: 'image', src: '/companies/luizalabs.webp', alt: 'Luizalabs', width: 48, height: 48 },
    ],
    photo: { src: '/photo.webp' },
    stack: ['React', 'React Native', 'Node.js', 'TypeScript'],
  },
  {
    id: 'lemon-atto',
    year: '2026',
    logos: [
      {
        kind: 'image',
        src: '/companies/lemon-logo-green.png',
        alt: 'Lemon Energia',
        width: 155,
        height: 40,
      },
      { kind: 'atto' },
    ],
    photo: { src: '/images/hero-ranielli.webp' },
    stack: ['TypeScript', 'Node.js', 'React', 'IA'],
  },
]
