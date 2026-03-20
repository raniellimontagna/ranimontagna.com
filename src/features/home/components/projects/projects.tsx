import { SiGithub } from '@icons-pack/react-simple-icons'
import {
  Buildings,
  Code,
  Global,
  Monitor,
  Smartphone,
  SquareArrowRightUp,
  User,
} from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { projectsData } from '@/features/projects/data/projects.static'
import { getProjectImages } from '@/features/projects/lib/project-images'
import type { ProjectType } from '@/features/projects/types/projects.types'
import {
  BlurReveal,
  FadeIn,
  MagneticHover,
  ParallaxLayer,
  RevealText,
} from '@/shared/components/animations'
import { Link } from '@/shared/config/i18n/navigation'
import { socialLinks } from '@/shared/lib/social-links'
import { FeaturedCarousel } from './featured-carousel'
import { ProjectCard } from './project-card'

const typeIcons = {
  web: Global,
  mobile: Smartphone,
  desktop: Monitor,
}

export function Projects() {
  const t = useTranslations('projects')

  const projects: ProjectType[] = projectsData.map((p) => ({
    ...p,
    type: p.type as ProjectType['type'],
    role: p.role as ProjectType['role'],
    category: p.category as ProjectType['category'],
    title: t(`list.${p.i18nKey}.title`),
    description: t(`list.${p.i18nKey}.description`),
    image: getProjectImages(p)[0] ?? '',
    images: getProjectImages(p),
    github: p.github ?? '',
    demo: p.demo ?? '',
  }))

  const featuredProjects = projects.filter((p) => p.featured)
  const [leadProject, ...secondaryProjects] = featuredProjects
  const LeadIcon = leadProject ? typeIcons[leadProject.type] : Global
  const leadProjectImages = leadProject?.images ?? []

  return (
    <section id="projects" className="relative overflow-hidden py-14 sm:py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 atmospheric-grid opacity-50" />
      <div className="absolute top-0 right-0 -z-10 h-125 w-125 rounded-full bg-accent-ice/14 blur-[140px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-125 w-125 rounded-full bg-accent/10 blur-[140px]" />

      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
          <div>
            <FadeIn delay={0.15}>
              <div className="editorial-kicker mb-6">
                <Code className="h-4 w-4" />
                {t('badge')}
              </div>
            </FadeIn>

            <RevealText
              text={`${t('title.part1')} ${t('title.part2')}`}
              className="max-w-xl font-heading text-3xl font-semibold tracking-[-0.08em] text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
            />
          </div>

          <FadeIn delay={0.35}>
            <div className="lg:pl-8">
              <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">{t('subtitle')}</p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <MagneticHover strength={14} className="w-full sm:w-auto">
                  <Link
                    href="/projects"
                    className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform duration-300 sm:inline-flex sm:w-auto hover:-translate-y-0.5"
                  >
                    <span>{t('viewAll')}</span>
                    <SquareArrowRightUp className="h-4 w-4" />
                  </Link>
                </MagneticHover>

                <MagneticHover strength={12} className="w-full sm:w-auto">
                  <a
                    href={socialLinks.github.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors sm:inline-flex sm:w-auto hover:border-foreground/30 hover:bg-surface-strong"
                  >
                    <SiGithub className="h-4 w-4" />
                    {t('cta.button')}
                  </a>
                </MagneticHover>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Lead Project — full width */}
        {leadProject && (
          <BlurReveal delay={0.35} className="mt-8 sm:mt-14">
            <ParallaxLayer offset={28}>
              <article className="surface-panel-strong relative overflow-hidden rounded-3xl shadow-(--shadow-card) sm:rounded-4xl">
                <div className="absolute inset-0 glow-gradient-strong" />

                {/* Image carousel — full width top */}
                <div className="relative aspect-video w-full overflow-hidden sm:aspect-21/9">
                  {leadProjectImages.length > 0 ? (
                    <FeaturedCarousel images={leadProjectImages} alt={leadProject.title} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center glow-gradient-preview">
                      <LeadIcon className="h-20 w-20 text-foreground/75" />
                    </div>
                  )}

                  {/* Badges over image */}
                  <div className="pointer-events-none absolute top-4 left-4 z-20 flex items-center gap-2 sm:top-6 sm:left-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/90 shadow-lg backdrop-blur-md">
                      <LeadIcon className="h-3.5 w-3.5" />
                      {leadProject.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/90 shadow-lg backdrop-blur-md">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {t('card.featuredBadge')}
                    </span>
                  </div>

                  {/* Company badge top-right */}
                  <div className="pointer-events-none absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/55 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/88 backdrop-blur-md">
                      <Buildings className="h-3 w-3" />
                      {leadProject.company}
                    </span>
                  </div>

                </div>

                {/* Content area */}
                <div className="relative p-5 sm:p-8 lg:p-10">
                  <div>
                    <div className="max-w-3xl">
                      <h3 className="text-2xl font-semibold tracking-[-0.06em] text-foreground sm:text-3xl lg:text-4xl">
                        {leadProject.title}
                      </h3>

                      <p className="mt-4 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                        {leadProject.description}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {t(`card.role.${leadProject.role}`)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Buildings className="h-3.5 w-3.5" />
                          {leadProject.company}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {leadProject.highlights.slice(0, 6).map((h) => (
                          <span
                            key={h}
                            className="rounded-full border border-accent/20 bg-accent/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-accent-strong dark:text-accent-ice"
                          >
                            {t(`card.highlights.${h}`)}
                          </span>
                        ))}
                        {leadProject.highlights.length > 6 && (
                          <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                            +{leadProject.highlights.length - 6}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {leadProject.technologies.slice(0, 6).map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                        {leadProject.technologies.length > 6 && (
                          <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted">
                            {t('card.moreCount', {
                              count: leadProject.technologies.length - 6,
                            })}
                          </span>
                        )}
                      </div>

                      <div className="mt-7 flex flex-wrap gap-3">
                        {leadProject.demo && (
                          <a
                            href={leadProject.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-transform duration-300 hover:-translate-y-0.5"
                          >
                            <SquareArrowRightUp className="h-4 w-4" />
                            {t('featuredTitle')}
                          </a>
                        )}
                        {leadProject.github && (
                          <a
                            href={leadProject.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-surface-strong"
                          >
                            <SiGithub className="h-4 w-4" />
                            {t('cta.button')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </ParallaxLayer>
          </BlurReveal>
        )}

        {/* Secondary Projects — 3-column grid */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryProjects.map((project, index) => (
            <FadeIn key={project.id} delay={0.45 + index * 0.12} blur scale className="h-full">
              <ProjectCard project={project} animationDelay="0ms" />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
