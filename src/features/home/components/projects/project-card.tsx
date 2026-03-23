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
import {
  getProjectTechBadgeTone,
  ProjectBadge,
  ProjectFeaturedIcon,
  projectTypeBadgeTone,
} from './project-badge'

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
      glow: 'group-hover:shadow-sky-500/15 dark:group-hover:shadow-sky-400/10',
    },
    mobile: {
      glow: 'group-hover:shadow-emerald-500/15 dark:group-hover:shadow-emerald-400/10',
    },
    desktop: {
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
          <ProjectBadge
            icon={<Icon className="h-3.5 w-3.5" />}
            variant="overlay"
            className={`${projectTypeBadgeTone[project.type]} group-hover:scale-105`}
          >
            {project.type}
          </ProjectBadge>
        </div>

        {project.featured && (
          <div className="absolute top-3 right-3 z-10">
            <ProjectBadge
              icon={<ProjectFeaturedIcon className="h-3 w-3" />}
              variant="overlayAccent"
            >
              {t('featuredBadge')}
            </ProjectBadge>
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
              <ProjectBadge key={h} variant="accent">
                {t(`highlights.${h}`)}
              </ProjectBadge>
            ))}
            {project.highlights.length > 4 && (
              <ProjectBadge variant="muted">+{project.highlights.length - 4}</ProjectBadge>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <ProjectBadge
              key={tech}
              typography="label"
              className={`${getProjectTechBadgeTone(tech)} hover:-translate-y-px`}
            >
              {tech}
            </ProjectBadge>
          ))}
          {project.technologies.length > 4 && (
            <ProjectBadge variant="muted">
              {t('moreCount', { count: project.technologies.length - 4 })}
            </ProjectBadge>
          )}
        </div>
      </div>
    </article>
  )
}
