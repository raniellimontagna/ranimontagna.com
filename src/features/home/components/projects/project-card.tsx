'use client'

import { Code, Global, Smartphone, SquareArrowRightUp } from '@solar-icons/react/ssr'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import type { ProjectCardProps } from '@/features/projects/types/projects.types'
import { GithubIcon } from '@/shared/components/icons/brands'

// Tech stack colors for visual variety
const techColors: Record<string, string> = {
  React:
    'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-400/10 dark:text-cyan-400 dark:border-cyan-400/20',
  'React Native':
    'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:bg-cyan-400/10 dark:text-cyan-400 dark:border-cyan-400/20',
  'Next.js':
    'bg-slate-800/10 text-slate-800 border-slate-800/20 dark:bg-white/10 dark:text-white dark:border-white/20',
  TypeScript:
    'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20',
  JavaScript:
    'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/20',
  'Node.js':
    'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/20',
  Golang:
    'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-400/10 dark:text-sky-400 dark:border-sky-400/20',
  Go: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:bg-sky-400/10 dark:text-sky-400 dark:border-sky-400/20',
  Python:
    'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:bg-yellow-400/10 dark:text-yellow-300 dark:border-yellow-400/20',
  PostgreSQL:
    'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:border-indigo-400/20',
  MongoDB:
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20',
  Redis:
    'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/20',
  Docker:
    'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20',
  AWS: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20',
  Tailwind:
    'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:bg-teal-400/10 dark:text-teal-400 dark:border-teal-400/20',
  TailwindCSS:
    'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:bg-teal-400/10 dark:text-teal-400 dark:border-teal-400/20',
  GraphQL:
    'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:bg-pink-400/10 dark:text-pink-400 dark:border-pink-400/20',
  Firebase:
    'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20',
  Supabase:
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20',
  Prisma:
    'bg-slate-600/10 text-slate-700 border-slate-600/20 dark:bg-slate-300/10 dark:text-slate-300 dark:border-slate-300/20',
  Fastify:
    'bg-slate-600/10 text-slate-700 border-slate-600/20 dark:bg-slate-300/10 dark:text-slate-300 dark:border-slate-300/20',
  NestJS:
    'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/20',
  Express:
    'bg-slate-600/10 text-slate-700 border-slate-600/20 dark:bg-slate-300/10 dark:text-slate-300 dark:border-slate-300/20',
  Vue: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20',
  'Vue.js':
    'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/20',
  Sass: 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:bg-pink-400/10 dark:text-pink-400 dark:border-pink-400/20',
  Expo: 'bg-slate-800/10 text-slate-800 border-slate-800/20 dark:bg-white/10 dark:text-white dark:border-white/20',
}

const defaultTechColor =
  'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'

function getTechColor(tech: string): string {
  // Check for exact match first
  if (techColors[tech]) return techColors[tech]

  // Check for partial match
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

  const Icon = {
    web: Global,
    mobile: Smartphone,
    api: Code,
  }[project.type]

  const typeStyles = {
    web: {
      badge:
        'text-blue-600 bg-blue-500/10 border-blue-500/30 dark:text-blue-400 dark:bg-blue-400/10 dark:border-blue-400/30',
      glow: 'group-hover:shadow-blue-500/20 dark:group-hover:shadow-blue-400/10',
    },
    mobile: {
      badge:
        'text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-400/30',
      glow: 'group-hover:shadow-emerald-500/20 dark:group-hover:shadow-emerald-400/10',
    },
    api: {
      badge:
        'text-purple-600 bg-purple-500/10 border-purple-500/30 dark:text-purple-400 dark:bg-purple-400/10 dark:border-purple-400/30',
      glow: 'group-hover:shadow-purple-500/20 dark:group-hover:shadow-purple-400/10',
    },
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate rotation (max 6 degrees)
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
        group relative flex h-full flex-col overflow-hidden rounded-2xl
        bg-white/80 backdrop-blur-sm
        border border-slate-200/80
        shadow-lg shadow-slate-200/50
        transition-all duration-500 ease-out
        hover:shadow-2xl ${typeStyles[project.type].glow}
        hover:border-slate-300/80
        dark:bg-slate-900/80 dark:border-slate-700/50
        dark:shadow-none
        dark:hover:border-slate-600/80
        dark:hover:shadow-xl dark:hover:shadow-slate-950/50
      `}
      style={{
        animationDelay,
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Animated gradient border overlay */}
      <div
        className={`
          absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-500
          group-hover:opacity-100
          bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20
          dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10
          blur-xl
        `}
      />

      {/* Shine effect on hover */}
      <div
        className={`
          absolute inset-0 -z-5 opacity-0 transition-opacity duration-700
          group-hover:opacity-100
          pointer-events-none
        `}
        style={{
          background: isHovering
            ? `radial-gradient(600px circle at ${transform.rotateY * 10 + 50}% ${-transform.rotateX * 10 + 30}%, rgba(255,255,255,0.1), transparent 40%)`
            : 'none',
        }}
      />

      {/* Image / Header Area */}
      <div className="relative aspect-video w-full overflow-hidden">
        {project.image ? (
          <>
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Image overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <div className="relative">
              {/* Icon glow */}
              <div className="absolute inset-0 blur-2xl opacity-50 transition-opacity duration-500 group-hover:opacity-80">
                <Icon className="h-20 w-20 text-slate-400 dark:text-slate-500" />
              </div>
              <Icon className="relative h-16 w-16 text-slate-400 transition-all duration-500 group-hover:scale-110 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-500" />
            </div>
          </div>
        )}

        {/* Type Badge - Top Left with glass effect */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`
              inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5
              text-xs font-semibold backdrop-blur-md shadow-lg
              transition-all duration-300 group-hover:scale-105
              ${typeStyles[project.type].badge}
            `}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="capitalize">{project.type}</span>
          </span>
        </div>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="relative inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg shadow-orange-500/30">
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 blur transition-opacity duration-500 group-hover:opacity-50" />
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="relative">{t('featuredBadge')}</span>
            </span>
          </div>
        )}

        {/* Actions Overlay with glassmorphism */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 bg-white/60 backdrop-blur-md opacity-0 transition-all duration-400 group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-950/60">
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
                <GithubIcon className="h-5 w-5" />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex h-12 w-12 items-center justify-center rounded-xl
                  bg-gradient-to-br from-blue-500 to-blue-600 text-white
                  shadow-lg shadow-blue-500/30
                  backdrop-blur-sm
                  transition-all duration-300
                  hover:scale-110 hover:from-blue-400 hover:to-blue-500 hover:shadow-xl hover:shadow-blue-500/40
                  dark:from-blue-600 dark:to-blue-700
                  dark:hover:from-blue-500 dark:hover:to-blue-600
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

      {/* Content Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 text-lg font-bold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-slate-800 dark:text-slate-100 dark:group-hover:text-white">
          {project.title}
        </h3>

        <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {project.description}
        </p>

        {/* Tech Stack with colorful badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className={`
                inline-flex items-center rounded-md border px-2 py-0.5
                text-[10px] font-semibold uppercase tracking-wide
                transition-all duration-300 hover:scale-105
                ${getTechColor(tech)}
              `}
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-500">
              {t('moreCount', { count: project.technologies.length - 4 })}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
