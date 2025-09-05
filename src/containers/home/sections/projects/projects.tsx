'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Github, ExternalLink, Code, Smartphone, Globe } from 'lucide-react'

import type { FilterType, ProjectCardProps, ProjectType } from './projects.types'
import { projectsData } from './project.static'

function ProjectCard({ project, animationDelay }: ProjectCardProps) {
  const Icon = {
    web: Globe,
    mobile: Smartphone,
    api: Code,
  }[project.type]

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      style={{ animationDelay }}
    >
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:16px_16px] dark:bg-[radial-gradient(#475569_1px,transparent_1px)]"></div>
        <Icon className="relative z-10 h-16 w-16 text-slate-400 transition-transform duration-500 group-hover:scale-110 dark:text-slate-600" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              project.type === 'web'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : project.type === 'mobile'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            }`}
          >
            {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
          </span>
          <div className="flex space-x-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} GitHub repository`}
                className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
        <h4 className="mb-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600 sm:text-xl dark:text-white dark:group-hover:text-blue-400">
          {project.title}
        </h4>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  const t = useTranslations('projects')
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const projects: ProjectType[] = projectsData.map((p) => ({
    ...p,
    type: p.type as 'mobile' | 'web' | 'api',
    title: t(`list.${p.i18nKey}.title`),
    description: t(`list.${p.i18nKey}.description`),
  }))

  const filters: FilterType[] = [
    { id: 'all', label: t('filters.all'), icon: Code },
    { id: 'web', label: t('filters.web'), icon: Globe },
    { id: 'mobile', label: t('filters.mobile'), icon: Smartphone },
    { id: 'api', label: t('filters.api'), icon: Code },
  ]

  const filteredProjects =
    activeFilter === 'all' ? projects : projects.filter((project) => project.type === activeFilter)
  const featuredProjects = projects.filter((project) => project.featured)

  return (
    <section
      id="projects"
      className="relative overflow-hidden bg-slate-50 py-16 sm:py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-700/20"></div>
        <div className="absolute bottom-32 left-32 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl dark:bg-purple-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <div
            className={`mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-1000 dark:bg-slate-800 dark:text-slate-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <Code className="mr-2 h-4 w-4" />
            {t('badge')}
          </div>
          <h2
            className={`mb-6 text-3xl font-bold text-slate-900 transition-all delay-200 duration-1000 sm:text-4xl lg:text-6xl dark:text-slate-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            {t('title.part1')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('title.part2')}
            </span>
          </h2>
          <p
            className={`mx-auto max-w-3xl text-lg text-slate-600 transition-all delay-400 duration-1000 sm:text-xl dark:text-slate-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            {t('subtitle')}
          </p>
        </div>

        <div
          className={`mb-16 transition-all delay-600 duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            {t('featuredTitle')}
          </h3>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                animationDelay={`${600 + index * 200}ms`}
                priority={index < 3}
              />
            ))}
          </div>
        </div>

        <div
          className={`mb-12 flex justify-center transition-all delay-800 duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          <div className="flex flex-wrap justify-center gap-2 rounded-lg bg-white p-2 shadow-lg dark:bg-slate-900">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 sm:px-5 sm:py-2.5 ${activeFilter === filter.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400'}`}
              >
                <filter.icon className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div
          className={`grid gap-6 transition-all delay-1000 duration-1000 md:grid-cols-2 md:gap-8 lg:grid-cols-3 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              animationDelay={`${1000 + index * 150}ms`}
            />
          ))}
        </div>

        <div
          className={`mt-12 text-center transition-all delay-1200 duration-1000 lg:mt-16 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          <p className="mb-6 text-slate-600 dark:text-slate-300">{t('cta.text')}</p>
          <a
            href="#contact"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
          >
            {t('cta.button')}
          </a>
        </div>
      </div>
    </section>
  )
}
