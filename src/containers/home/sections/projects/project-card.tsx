'use client'

import { Code, SquareArrowRightUp, Global, Smartphone } from '@solar-icons/react/ssr'
import { GithubIcon } from '@/components/icons/brands'
import Image from 'next/image'
import type { ProjectCardProps } from './projects.types'

export function ProjectCard({ project, animationDelay, priority = false }: ProjectCardProps) {
  const Icon = {
    web: Global,
    mobile: Smartphone,
    api: Code,
  }[project.type]

  return (
    <div
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
      style={{ animationDelay }}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-500 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 group-hover:opacity-100" />

      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-size-[16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]" />

        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Icon className="relative z-10 h-16 w-16 text-slate-300 transition-transform duration-500 group-hover:scale-110 dark:text-slate-700" />
          </div>
        )}

        {/* Type Badge Overlay */}
        <div className="absolute top-4 left-4 z-20">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs font-semibold backdrop-blur-md ${
              project.type === 'web'
                ? 'border-blue-200/50 bg-blue-50/90 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/80 dark:text-blue-300'
                : project.type === 'mobile'
                  ? 'border-green-200/50 bg-green-50/90 text-green-700 dark:border-green-900/50 dark:bg-green-900/80 dark:text-green-300'
                  : 'border-purple-200/50 bg-purple-50/90 text-purple-700 dark:border-purple-900/50 dark:bg-purple-900/80 dark:text-purple-300'
            }`}
          >
            {project.type === 'web' && <Global className="mr-1.5 h-3 w-3" />}
            {project.type === 'mobile' && <Smartphone className="mr-1.5 h-3 w-3" />}
            {project.type === 'api' && <Code className="mr-1.5 h-3 w-3" />}
            {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h4 className="text-xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {project.title}
          </h4>

          <div className="flex shrink-0 gap-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} GitHub repository`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                <SquareArrowRightUp className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
