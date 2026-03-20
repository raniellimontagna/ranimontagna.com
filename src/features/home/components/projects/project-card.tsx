'use client'

import { SiGithub } from '@icons-pack/react-simple-icons'
import {
  Buildings,
  Global,
  Monitor,
  Smartphone,
  SquareArrowRightUp,
  User,
} from '@solar-icons/react/ssr'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { getProjectImages } from '@/features/projects/lib/project-images'
import type { ProjectCardProps } from '@/features/projects/types/projects.types'

// Tech stack colors for visual variety
const techColors: Record<string, string> = {
  React:
    'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300',
  'React Native':
    'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300',
  'Next.js':
    'border-slate-900/15 bg-slate-900/10 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white',
  TypeScript:
    'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300',
  JavaScript:
    'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400/20 dark:bg-yellow-400/10 dark:text-yellow-300',
  'Node.js':
    'border-green-500/20 bg-green-500/10 text-green-700 dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-300',
  Golang:
    'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300',
  Go: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300',
  Python:
    'border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:border-yellow-400/20 dark:bg-yellow-400/10 dark:text-yellow-300',
  PostgreSQL:
    'border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-300',
  MongoDB:
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
  Redis:
    'border-red-500/20 bg-red-500/10 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300',
  Docker:
    'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300',
  AWS: 'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-300',
  Tailwind:
    'border-teal-500/20 bg-teal-500/10 text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300',
  TailwindCSS:
    'border-teal-500/20 bg-teal-500/10 text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300',
  GraphQL:
    'border-pink-500/20 bg-pink-500/10 text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-300',
  Firebase:
    'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300',
  Supabase:
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
  Prisma:
    'border-slate-600/20 bg-slate-600/10 text-slate-700 dark:border-slate-300/15 dark:bg-slate-300/10 dark:text-slate-300',
  Fastify:
    'border-slate-600/20 bg-slate-600/10 text-slate-700 dark:border-slate-300/15 dark:bg-slate-300/10 dark:text-slate-300',
  NestJS:
    'border-red-500/20 bg-red-500/10 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300',
  Express:
    'border-slate-600/20 bg-slate-600/10 text-slate-700 dark:border-slate-300/15 dark:bg-slate-300/10 dark:text-slate-300',
  Vue: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
  'Vue.js':
    'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
  Sass: 'border-pink-500/20 bg-pink-500/10 text-pink-700 dark:border-pink-400/20 dark:bg-pink-400/10 dark:text-pink-300',
  Expo: 'border-slate-900/15 bg-slate-900/10 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-white',
  Electron:
    'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300',
  'Micro-frontend':
    'border-purple-500/20 bg-purple-500/10 text-purple-700 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-300',
}

const defaultTechColor = 'border-line bg-surface text-muted'

function getTechColor(tech: string): string {
  if (techColors[tech]) return techColors[tech]

  for (const [key, value] of Object.entries(techColors)) {
    if (tech.toLowerCase().includes(key.toLowerCase())) return value
  }

  return defaultTechColor
}

export function ProjectCard({ project, animationDelay, priority = false }: ProjectCardProps) {
  const t = useTranslations('projects.card')
  const cardRef = useRef<HTMLElement>(null)
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const primaryImage = getProjectImages(project)[0] ?? ''

  const Icon = {
    web: Global,
    mobile: Smartphone,
    desktop: Monitor,
  }[project.type]

  const typeStyles = {
    web: {
      badge:
        'border-sky-400/30 bg-sky-950/70 text-sky-200 dark:border-sky-400/25 dark:bg-sky-950/75 dark:text-sky-300',
      glow: 'group-hover:shadow-sky-500/15 dark:group-hover:shadow-sky-400/10',
    },
    mobile: {
      badge:
        'border-emerald-400/30 bg-emerald-950/70 text-emerald-200 dark:border-emerald-400/25 dark:bg-emerald-950/75 dark:text-emerald-300',
      glow: 'group-hover:shadow-emerald-500/15 dark:group-hover:shadow-emerald-400/10',
    },
    desktop: {
      badge:
        'border-violet-400/30 bg-violet-950/70 text-violet-200 dark:border-violet-400/25 dark:bg-violet-950/75 dark:text-violet-300',
      glow: 'group-hover:shadow-violet-500/15 dark:group-hover:shadow-violet-400/10',
    },
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -6
    const rotateY = ((x - centerX) / centerX) * 6

    setTransform({ rotateX, rotateY })
  }

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 })
    setIsHovering(false)
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        group relative flex h-full flex-col overflow-hidden rounded-[1.75rem]
        border border-line
        bg-surface/92 backdrop-blur-sm
        shadow-(--shadow-card)
        transition-all duration-500 ease-out
        hover:shadow-2xl ${typeStyles[project.type].glow}
        hover:-translate-y-1 hover:border-foreground/12
      `}
      style={{
        animationDelay,
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className={`
          absolute inset-0 -z-10 rounded-[1.75rem] opacity-0 transition-opacity duration-500
          group-hover:opacity-100
          bg-linear-to-br from-accent/10 via-transparent to-accent-ice/18
          blur-2xl
        `}
      />

      <div
        className={`
          absolute inset-0 -z-5 opacity-0 transition-opacity duration-700
          group-hover:opacity-100
          pointer-events-none
        `}
        style={{
          background: isHovering
            ? `radial-gradient(560px circle at ${transform.rotateY * 10 + 50}% ${-transform.rotateX * 10 + 30}%, rgba(255,255,255,0.14), transparent 42%)`
            : 'none',
        }}
      />

      <div className="relative aspect-video w-full overflow-hidden">
        {primaryImage ? (
          <>
            <Image
              src={primaryImage}
              alt={project.title}
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/45 via-transparent to-white/10 opacity-85" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center glow-gradient-card-placeholder">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-50 transition-opacity duration-500 group-hover:opacity-80">
                <Icon className="h-20 w-20 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="absolute inset-0 rounded-full border border-white/40 dark:border-white/10" />
              <Icon className="relative h-16 w-16 text-slate-500 transition-all duration-500 group-hover:scale-110 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300" />
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 z-10">
          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5
              font-mono text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md shadow-lg
              transition-all duration-300 group-hover:scale-105
              ${typeStyles[project.type].badge}
            `}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{project.type}</span>
          </span>
        </div>

        {project.featured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="relative inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-slate-950/80 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200 shadow-lg backdrop-blur-md dark:border-amber-400/25 dark:text-amber-300">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{t('featuredBadge')}</span>
            </span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-white/55 backdrop-blur-md opacity-0 transition-all duration-400 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-950/55">
          <div className="flex translate-y-6 scale-90 gap-4 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:scale-100 group-focus-within:translate-y-0 group-focus-within:scale-100">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex h-12 w-12 items-center justify-center rounded-xl
                  bg-white/90 text-slate-700 shadow-lg ring-1 ring-slate-200/50
                  backdrop-blur-sm
                  transition-all duration-300
                  hover:scale-110 hover:bg-white hover:text-slate-900 hover:shadow-xl
                  dark:bg-slate-800/90 dark:text-slate-300 dark:ring-slate-700/50
                  dark:hover:bg-slate-700 dark:hover:text-white
                "
                aria-label="View Source on GitHub"
                title="View Source code"
              >
                <SiGithub className="h-5 w-5" />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex h-12 w-12 items-center justify-center rounded-xl
                  bg-linear-to-br from-foreground to-slate-700 text-white
                  shadow-lg shadow-slate-900/20
                  backdrop-blur-sm
                  transition-all duration-300
                  hover:scale-110 hover:from-slate-800 hover:to-slate-700 hover:shadow-xl
                "
                aria-label="View Live Demo"
                title="View Live Site"
              >
                <SquareArrowRightUp className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Buildings className="h-3 w-3" />
            {project.company}
          </span>
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {t(`role.${project.role}`)}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-semibold tracking-[-0.05em] text-foreground transition-colors duration-300">
          {project.title}
        </h3>

        <p className="mb-4 flex-1 text-sm leading-7 text-muted">{project.description}</p>

        {project.highlights.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {project.highlights.slice(0, 4).map((h) => (
              <span
                key={h}
                className="rounded-full border border-accent/20 bg-accent/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-accent-strong dark:text-accent-ice"
              >
                {t(`highlights.${h}`)}
              </span>
            ))}
            {project.highlights.length > 4 && (
              <span className="rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted">
                +{project.highlights.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className={`
                inline-flex items-center rounded-full border px-2.5 py-1
                text-[10px] font-semibold uppercase tracking-[0.16em]
                transition-all duration-300 hover:scale-105
                ${getTechColor(tech)}
              `}
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="inline-flex items-center rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {t('moreCount', { count: project.technologies.length - 4 })}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
