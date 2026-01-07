'use client'

import { Code, SquareArrowRightUp } from '@solar-icons/react/ssr'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { FadeIn } from '@/components/animations'
import { ProjectCard } from './project-card'
import { projectsData } from './projects.static'
import type { ProjectType } from './projects.types'

export function Projects() {
  const t = useTranslations('projects')
  const locale = useLocale()

  const projects: ProjectType[] = projectsData.map((p) => ({
    ...p,
    // Cast strict string union from static file to simpler string type if needed,
    // or keep as is if types match.
    // projectsData types are inferred, ProjectType has specific union for 'type'.
    type: p.type as 'mobile' | 'web' | 'api',
    title: t(`list.${p.i18nKey}.title`),
    description: t(`list.${p.i18nKey}.description`),
    // Use fallback empty strings if null
    image: p.image ?? '',
    github: p.github ?? '',
    demo: p.demo ?? '',
  }))

  const featuredProjects = projects.filter((p) => p.featured)

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

        {/* Featured Projects Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <FadeIn key={project.id} delay={0.8 + index * 0.1} className="h-full">
              <ProjectCard project={project} animationDelay="0ms" />
            </FadeIn>
          ))}
        </div>

        {/* See All Button */}
        <FadeIn delay={1.2}>
          <div className="mt-16 flex justify-center">
            <Link
              href={`/${locale}/projects`}
              className="group inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl hover:scale-105 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <span>{t('viewAll')}</span>
              <SquareArrowRightUp className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
