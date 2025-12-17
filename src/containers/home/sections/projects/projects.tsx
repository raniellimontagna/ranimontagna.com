'use client'

import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { getGitHubUrl } from '@/constants/socialLinks'
import { Code, ExternalLink, Github, Globe, Smartphone } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { projectsData } from './projects.static'
import { ProjectCard } from './project-card'
import { TerminalWindow } from '@/components/ui/terminal-window'
import type { FilterType, ProjectType } from './projects.types'

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
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <FadeIn delay={0.2}>
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 font-mono text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
              <Code className="mr-2 h-4 w-4" />
              {t('badge')}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-100">
              {t('title.part1')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                {t('title.part2')}
              </span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.6}>
            <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-400">
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
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
              {filters.map((filter) => (
                <button
                  type="button"
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  aria-label={`Filter projects by ${filter.label}`}
                  title={filter.label}
                  className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    activeFilter === filter.id
                      ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <filter.icon className="h-4 w-4" aria-hidden="true" />
                  <span className="ml-2 hidden sm:inline">{filter.label}</span>
                  <span className="sr-only sm:hidden">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <StaggerContainer staggerDelay={0.1}>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} animationDelay="0ms" />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <FadeIn delay={1.4}>
          <div className="mt-16 lg:mt-24">
            <div className="mt-16 lg:mt-24 mx-auto max-w-4xl">
              <TerminalWindow title="ranni@portfolio:~/projects">
                <div className="space-y-6">
                  {/* Command Input */}
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <span className="text-green-600 dark:text-green-400">➜</span>
                    <span className="text-blue-600 dark:text-blue-400">~</span>
                    <span>$ cat open-source.md</span>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 pl-4">
                    <p className="font-mono text-slate-700 dark:text-slate-300">{t('cta.text')}</p>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700/50 dark:bg-slate-900/50">
                      <pre className="font-mono text-sm leading-relaxed">
                        <span className="text-purple-600 dark:text-purple-400">const</span>{' '}
                        <span className="text-blue-600 dark:text-blue-400">githubStats</span>{' '}
                        <span className="text-slate-500 dark:text-slate-400">=</span>{' '}
                        <span className="text-yellow-600 dark:text-yellow-400">{'{'}</span>
                        {'\n  '}
                        <span className="text-blue-600 dark:text-blue-300">"repositories"</span>:{' '}
                        <span className="text-green-600 dark:text-green-400">"50+"</span>,{'\n  '}
                        <span className="text-blue-600 dark:text-blue-300">"commits_year"</span>:{' '}
                        <span className="text-green-600 dark:text-green-400">"1K+"</span>
                        {'\n'}
                        <span className="text-yellow-600 dark:text-yellow-400">{'}'}</span>
                      </pre>
                    </div>

                    <div className="pt-2">
                      <a
                        href={getGitHubUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center text-green-600 hover:text-green-700 hover:underline decoration-dashed transition-colors dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        <span>{t('cta.button')}</span>
                        <ExternalLink className="ml-2 h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
                      </a>
                      <span className="inline-block w-2 h-4 bg-slate-400 ml-1 align-middle animate-pulse" />
                    </div>
                  </div>
                </div>
              </TerminalWindow>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
