import type { ReactNode } from 'react'
import type { ProjectType } from '@/features/projects/types/projects.types'
import { cn } from '@/shared/lib/utils'

type ProjectBadgeVariant =
  | 'surface'
  | 'muted'
  | 'accent'
  | 'overlay'
  | 'overlayAccent'
  | 'overlayMuted'

type ProjectBadgeTypography = 'mono' | 'label'

type ProjectBadgeProps = {
  children: ReactNode
  className?: string
  icon?: ReactNode
  typography?: ProjectBadgeTypography
  variant?: ProjectBadgeVariant
}

const badgeVariants: Record<ProjectBadgeVariant, string> = {
  surface: 'border-line bg-surface/94 text-foreground shadow-sm',
  muted: 'border-line bg-surface/72 text-muted shadow-sm',
  accent: 'border-accent/20 bg-accent/8 text-accent-strong shadow-sm dark:text-accent-ice',
  overlay:
    'border-white/16 bg-slate-950/62 text-white/92 shadow-lg shadow-slate-950/25 backdrop-blur-md',
  overlayAccent:
    'border-amber-400/30 bg-slate-950/78 text-amber-200 shadow-lg shadow-slate-950/30 backdrop-blur-md dark:border-amber-400/25 dark:text-amber-300',
  overlayMuted:
    'border-white/16 bg-slate-950/55 text-white/86 shadow-lg shadow-slate-950/20 backdrop-blur-md',
}

const badgeTypography: Record<ProjectBadgeTypography, string> = {
  mono: 'font-mono text-[10px] font-semibold uppercase tracking-[0.16em]',
  label: 'text-[11px] font-medium tracking-[-0.01em]',
}

export const projectTypeBadgeTone: Record<ProjectType['type'], string> = {
  web: 'border-sky-400/26 bg-sky-950/74 text-sky-200 dark:border-sky-400/22 dark:bg-sky-950/80 dark:text-sky-300',
  mobile:
    'border-emerald-400/26 bg-emerald-950/74 text-emerald-200 dark:border-emerald-400/22 dark:bg-emerald-950/80 dark:text-emerald-300',
  desktop:
    'border-violet-400/26 bg-violet-950/74 text-violet-200 dark:border-violet-400/22 dark:bg-violet-950/80 dark:text-violet-300',
}

const techBadgeTones: Record<string, string> = {
  React:
    'border-cyan-500/18 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/18 dark:bg-cyan-400/10 dark:text-cyan-300',
  'React Native':
    'border-cyan-500/18 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/18 dark:bg-cyan-400/10 dark:text-cyan-300',
  'Next.js':
    'border-slate-900/12 bg-slate-900/9 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white',
  TypeScript:
    'border-blue-500/18 bg-blue-500/10 text-blue-700 dark:border-blue-400/18 dark:bg-blue-400/10 dark:text-blue-300',
  JavaScript:
    'border-yellow-500/18 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400/18 dark:bg-yellow-400/10 dark:text-yellow-300',
  'Node.js':
    'border-green-500/18 bg-green-500/10 text-green-700 dark:border-green-400/18 dark:bg-green-400/10 dark:text-green-300',
  Golang:
    'border-sky-500/18 bg-sky-500/10 text-sky-700 dark:border-sky-400/18 dark:bg-sky-400/10 dark:text-sky-300',
  Go: 'border-sky-500/18 bg-sky-500/10 text-sky-700 dark:border-sky-400/18 dark:bg-sky-400/10 dark:text-sky-300',
  Python:
    'border-yellow-500/18 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400/18 dark:bg-yellow-400/10 dark:text-yellow-300',
  PostgreSQL:
    'border-indigo-500/18 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/18 dark:bg-indigo-400/10 dark:text-indigo-300',
  MongoDB:
    'border-emerald-500/18 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-300',
  Redis:
    'border-red-500/18 bg-red-500/10 text-red-700 dark:border-red-400/18 dark:bg-red-400/10 dark:text-red-300',
  Docker:
    'border-blue-500/18 bg-blue-500/10 text-blue-700 dark:border-blue-400/18 dark:bg-blue-400/10 dark:text-blue-300',
  AWS: 'border-orange-500/18 bg-orange-500/10 text-orange-700 dark:border-orange-400/18 dark:bg-orange-400/10 dark:text-orange-300',
  Tailwind:
    'border-teal-500/18 bg-teal-500/10 text-teal-700 dark:border-teal-400/18 dark:bg-teal-400/10 dark:text-teal-300',
  TailwindCSS:
    'border-teal-500/18 bg-teal-500/10 text-teal-700 dark:border-teal-400/18 dark:bg-teal-400/10 dark:text-teal-300',
  GraphQL:
    'border-pink-500/18 bg-pink-500/10 text-pink-700 dark:border-pink-400/18 dark:bg-pink-400/10 dark:text-pink-300',
  Firebase:
    'border-amber-500/18 bg-amber-500/10 text-amber-700 dark:border-amber-400/18 dark:bg-amber-400/10 dark:text-amber-300',
  Supabase:
    'border-emerald-500/18 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-300',
  Prisma:
    'border-slate-600/18 bg-slate-600/10 text-slate-700 dark:border-slate-300/14 dark:bg-slate-300/10 dark:text-slate-300',
  Fastify:
    'border-slate-600/18 bg-slate-600/10 text-slate-700 dark:border-slate-300/14 dark:bg-slate-300/10 dark:text-slate-300',
  NestJS:
    'border-red-500/18 bg-red-500/10 text-red-700 dark:border-red-400/18 dark:bg-red-400/10 dark:text-red-300',
  Express:
    'border-slate-600/18 bg-slate-600/10 text-slate-700 dark:border-slate-300/14 dark:bg-slate-300/10 dark:text-slate-300',
  Vue: 'border-emerald-500/18 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-300',
  'Vue.js':
    'border-emerald-500/18 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/18 dark:bg-emerald-400/10 dark:text-emerald-300',
  Sass: 'border-pink-500/18 bg-pink-500/10 text-pink-700 dark:border-pink-400/18 dark:bg-pink-400/10 dark:text-pink-300',
  Expo: 'border-slate-900/12 bg-slate-900/9 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white',
  Electron:
    'border-sky-500/18 bg-sky-500/10 text-sky-700 dark:border-sky-400/18 dark:bg-sky-400/10 dark:text-sky-300',
  'Micro-frontend':
    'border-purple-500/18 bg-purple-500/10 text-purple-700 dark:border-purple-400/18 dark:bg-purple-400/10 dark:text-purple-300',
}

const defaultTechBadgeTone = 'border-line bg-surface/94 text-muted'

export function getProjectTechBadgeTone(tech: string): string {
  if (techBadgeTones[tech]) return techBadgeTones[tech]

  for (const [key, value] of Object.entries(techBadgeTones)) {
    if (tech.toLowerCase().includes(key.toLowerCase())) return value
  }

  return defaultTechBadgeTone
}

export function ProjectFeaturedIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-3.5 w-3.5', className)}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export function ProjectBadge({
  children,
  className,
  icon,
  typography = 'mono',
  variant = 'surface',
}: ProjectBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 whitespace-nowrap transition-all duration-300',
        badgeVariants[variant],
        badgeTypography[typography],
        className,
      )}
    >
      {icon ? <span className="shrink-0 [&_svg]:block">{icon}</span> : null}
      <span>{children}</span>
    </span>
  )
}
