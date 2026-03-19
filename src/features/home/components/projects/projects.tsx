import { Code, Global, Smartphone, SquareArrowRightUp } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { projectsData } from '@/features/projects/data/projects.static'
import type { ProjectType } from '@/features/projects/types/projects.types'
import { FadeIn, MagneticHover, ParallaxLayer, RevealText } from '@/shared/components/animations'
import { GithubIcon } from '@/shared/components/icons/brands'
import { Link } from '@/shared/config/i18n/navigation'
import { socialLinks } from '@/shared/lib/social-links'
import { ProjectCard } from './project-card'

export function Projects() {
  const t = useTranslations('projects')

  const projects: ProjectType[] = projectsData.map((p) => ({
    ...p,
    type: p.type as 'mobile' | 'web' | 'api',
    title: t(`list.${p.i18nKey}.title`),
    description: t(`list.${p.i18nKey}.description`),
    image: p.image ?? '',
    github: p.github ?? '',
    demo: p.demo ?? '',
  }))

  const featuredProjects = projects.filter((p) => p.featured)
  const [leadProject, ...secondaryProjects] = featuredProjects
  const LeadIcon = leadProject
    ? {
        web: Global,
        mobile: Smartphone,
        api: Code,
      }[leadProject.type]
    : Global

  return (
    <section id="projects" className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 atmospheric-grid opacity-50" />
      <div className="absolute top-0 right-0 -z-10 h-125 w-125 rounded-full bg-[color:var(--accent-ice)]/14 blur-[140px]" />
      <div className="absolute bottom-0 left-0 -z-10 h-125 w-125 rounded-full bg-[color:var(--accent)]/10 blur-[140px]" />

      <div className="section-shell relative z-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end">
          <div>
            <FadeIn delay={0.15}>
              <div className="editorial-kicker mb-6">
                <Code className="h-4 w-4" />
                {t('badge')}
              </div>
            </FadeIn>

            <RevealText
              text={`${t('title.part1')} ${t('title.part2')}`}
              className="max-w-xl font-heading text-4xl font-semibold tracking-[-0.08em] text-[color:var(--foreground)] sm:text-5xl lg:text-6xl"
            />
          </div>

          <FadeIn delay={0.35}>
            <div className="lg:pl-8">
              <p className="max-w-2xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
                {t('subtitle')}
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <MagneticHover strength={14}>
                  <Link
                    href="/projects"
                    className="inline-flex min-h-13 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-6 py-3 text-sm font-semibold text-[color:var(--background)] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <span>{t('viewAll')}</span>
                    <SquareArrowRightUp className="h-4 w-4" />
                  </Link>
                </MagneticHover>

                <MagneticHover strength={12}>
                  <a
                    href={socialLinks.github.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-13 items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition-colors hover:border-[color:var(--foreground)]/30 hover:bg-[color:var(--surface-strong)]"
                  >
                    <GithubIcon className="h-4 w-4" />
                    {t('cta.button')}
                  </a>
                </MagneticHover>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="mt-14 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          {leadProject && (
            <FadeIn delay={0.45} className="h-full">
              <ParallaxLayer offset={28}>
                <article className="surface-panel-strong relative h-full overflow-hidden rounded-[2rem] p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,202,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(162,255,61,0.16),transparent_30%)]" />
                  <div className="absolute top-8 right-8 h-32 w-32 rounded-full border border-white/45 bg-white/65 backdrop-blur dark:border-white/10 dark:bg-white/5" />
                  <div className="absolute right-14 bottom-14 h-52 w-52 rounded-full border border-[color:var(--line)]/50 bg-[color:var(--surface)]/65 backdrop-blur" />

                  <div className="relative grid h-full gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted)]">
                        <LeadIcon className="h-3.5 w-3.5" />
                        {t('featuredTitle')}
                      </div>

                      <h3 className="mt-6 text-3xl font-semibold tracking-[-0.06em] text-[color:var(--foreground)] sm:text-4xl">
                        {leadProject.title}
                      </h3>

                      <p className="mt-5 max-w-xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
                        {leadProject.description}
                      </p>

                      <div className="mt-7 flex flex-wrap gap-2">
                        {leadProject.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--foreground)]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="mt-8 flex flex-wrap gap-4">
                        {leadProject.demo && (
                          <a
                            href={leadProject.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition-transform duration-300 hover:-translate-y-0.5"
                          >
                            <SquareArrowRightUp className="h-4 w-4" />
                            {leadProject.type.toUpperCase()}
                          </a>
                        )}

                        {leadProject.github && (
                          <a
                            href={leadProject.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition-colors hover:border-[color:var(--foreground)]/30 hover:bg-[color:var(--surface-strong)]"
                          >
                            <GithubIcon className="h-4 w-4" />
                            {t('cta.button')}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="relative min-h-72">
                      <div className="absolute inset-0 rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--surface)]/80 backdrop-blur" />
                      <div className="absolute inset-5 rounded-[1.5rem] border border-white/45 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">
                            {leadProject.type}
                          </span>
                          <span className="rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
                            {t('card.featuredBadge')}
                          </span>
                        </div>

                        <div className="relative mt-8 flex h-[calc(100%-4rem)] items-center justify-center overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(111,202,255,0.18),transparent_38%),radial-gradient(circle_at_bottom,rgba(162,255,61,0.18),transparent_38%),linear-gradient(135deg,rgba(15,23,42,0.04),rgba(15,23,42,0.12))] dark:bg-[radial-gradient(circle_at_top,rgba(111,202,255,0.16),transparent_40%),radial-gradient(circle_at_bottom,rgba(162,255,61,0.14),transparent_36%),linear-gradient(135deg,rgba(15,23,42,0.9),rgba(2,6,23,0.92))]">
                          <div className="absolute left-6 top-6 h-18 w-18 rounded-full border border-white/40 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-white/5" />
                          <div className="absolute right-6 bottom-6 h-14 w-14 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)]" />
                          <LeadIcon className="h-20 w-20 text-[color:var(--foreground)]/75" />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </ParallaxLayer>
            </FadeIn>
          )}

          <div className="grid gap-6">
            {secondaryProjects.map((project, index) => (
              <FadeIn key={project.id} delay={0.55 + index * 0.1} className="h-full">
                <ProjectCard project={project} animationDelay="0ms" />
              </FadeIn>
            ))}
          </div>
        </div>

        <FadeIn delay={0.85}>
          <div className="surface-panel mt-8 grid gap-6 rounded-[1.75rem] px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--muted)]">
                {socialLinks.github.name}
              </p>
              <p className="mt-3 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
                {t('cta.text')}
              </p>
            </div>

            <MagneticHover strength={12}>
              <a
                href={socialLinks.github.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-6 py-3 text-sm font-semibold text-[color:var(--foreground)] transition-colors hover:border-[color:var(--foreground)]/30"
              >
                <GithubIcon className="h-4 w-4" />
                {t('cta.button')}
              </a>
            </MagneticHover>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
