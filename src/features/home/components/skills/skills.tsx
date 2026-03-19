'use client'

import { useTranslations } from 'next-intl'
import { FadeIn } from '@/shared/components/animations'
import { ParallaxLayer } from '@/shared/components/animations/parallax-layer'
import { SkillsOrbit } from './skills-orbit'

export function Skills() {
  const t = useTranslations('about.skills')

  return (
    <section
      data-testid="skills"
      className="relative overflow-hidden border-y border-line bg-background py-16 md:py-24"
    >
      <ParallaxLayer
        offset={30}
        className="pointer-events-none absolute top-0 right-[10%] h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-ambient-blue blur-[120px] opacity-20"
      />
      <ParallaxLayer
        offset={-20}
        axis="x"
        className="pointer-events-none absolute bottom-0 left-[10%] h-[300px] w-[300px] translate-y-1/2 rounded-full bg-ambient-lime blur-[100px] opacity-10"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-8 lg:px-12">
        <div className="mb-12 md:mb-16 text-center">
          <p className="font-mono text-sm font-semibold uppercase tracking-[0.24em] text-muted">
            {t('title')}
          </p>
          <h2 className="mx-auto mt-4 text-3xl font-display font-medium leading-tight md:text-5xl text-foreground max-w-3xl">
            A precise tech stack tailored for global demands.
          </h2>
        </div>

        <FadeIn delay={0.2}>
          <SkillsOrbit />
        </FadeIn>
      </div>
    </section>
  )
}
