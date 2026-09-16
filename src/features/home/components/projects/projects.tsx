import { SiGithub } from '@icons-pack/react-simple-icons'
import { Code, SquareArrowRightUp } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { projectsData } from '@/features/projects/data/projects.static'
import { getProjectImages } from '@/features/projects/lib/project-images'
import type { ProjectType } from '@/features/projects/types/projects.types'
import { FadeIn, MagneticHover, ParallaxLayer, RevealText } from '@/shared/components/animations'
import { Link } from '@/shared/config/i18n/navigation'
import { socialLinks } from '@/shared/lib/social-links'
import { ProjectTile } from './project-tile'

const MAX_HOME_PROJECTS = 8

export function Projects() {
  const t = useTranslations('projects')

  const projects: ProjectType[] = projectsData
    .filter((p) => p.featured)
    .slice(0, MAX_HOME_PROJECTS)
    .map((p) => ({
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

  return (
    <section
      id="projects"
      data-spectral-zone="balanced"
      className="relative overflow-hidden py-14 sm:py-20 lg:py-32"
    >
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
              as="h2"
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

        <ul className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project, index) => {
            const wide = index === 0
            // Colunas alternadas flutuam em velocidades diferentes: profundidade sem pesar.
            const offset = index % 2 === 0 ? 14 : -10
            return (
              <li key={project.id} className={wide ? 'h-full sm:col-span-2' : 'h-full'}>
                <FadeIn delay={0.15 + index * 0.07} blur className="h-full">
                  <ParallaxLayer offset={offset} className="h-full">
                    <ProjectTile project={project} priority={wide} wide={wide} />
                  </ParallaxLayer>
                </FadeIn>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
