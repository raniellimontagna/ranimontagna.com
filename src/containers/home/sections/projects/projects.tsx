'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Github, ExternalLink, Code, Smartphone, Globe } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'

import type { FilterType, ProjectCardProps, ProjectType } from './projects.types'
import { projectsData } from './projects.static'

function ProjectCard({ project, animationDelay }: ProjectCardProps) {
  const Icon = {
    web: Globe,
    mobile: Smartphone,
    api: Code,
  }[project.type]

  return (
    <div
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:border-slate-700 dark:bg-slate-900"
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
  const [activeFilter, setActiveFilter] = useState('all')

  const projects: ProjectType[] = projectsData.map((p) => ({
    ...p,
    type: p.type as 'mobile' | 'web' | 'api',
    title: t(`list.${p.i18nKey}.title`),
    description: t(`list.${p.i18nKey}.description`),
    image: p.image ?? '',
    github: p.github ?? '',
    demo: p.demo ?? '',
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
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Code className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-6xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t('title.part2')}
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-3xl text-lg text-slate-600 sm:text-xl dark:text-slate-300">
              {t('subtitle')}
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.8}>
          <div className="mb-16">
            <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              {t('featuredTitle')}
            </h3>
            <StaggerContainer staggerDelay={0.15}>
              <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {featuredProjects.map((project) => (
                  <StaggerItem key={project.id}>
                    <ProjectCard
                      project={project}
                      animationDelay="0ms"
                      priority={featuredProjects.indexOf(project) < 3}
                    />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </FadeIn>

        <FadeIn delay={1.0}>
          <div className="mb-12 flex justify-center">
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
        </FadeIn>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} animationDelay="0ms" />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <FadeIn delay={1.4}>
          <div className="mt-16 lg:mt-20">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8 text-center shadow-2xl lg:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl"></div>

              <div className="relative z-10">
                <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
                  <Github className="mr-2 h-4 w-4" />
                  Open Source
                </div>

                <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  {t('cta.text')}
                </h3>

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                  <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white lg:text-3xl">50+</div>
                    <div className="text-sm text-white/80">{t('cta.stats.repositories')}</div>
                  </div>
                  <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold text-white lg:text-3xl">1K+</div>
                    <div className="text-sm text-white/80">{t('cta.stats.commits')}</div>
                  </div>
                </div>

                <a
                  href="https://github.com/RanielliMontagna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg bg-white px-8 py-4 font-medium text-slate-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-slate-100 hover:shadow-xl"
                >
                  <Github className="mr-3 h-5 w-5" />
                  {t('cta.button')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
