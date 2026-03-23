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
      className="relative overflow-hidden border-y border-line bg-background py-14 sm:py-20 lg:py-32"
    >
      <ParallaxLayer
        offset={30}
        className="pointer-events-none absolute top-0 right-[10%] h-125 w-125 -translate-y-1/2 rounded-full bg-ambient-blue blur-[120px] opacity-20"
      />
      <ParallaxLayer
        offset={-20}
        axis="x"
        className="pointer-events-none absolute bottom-0 left-[10%] h-75 w-75 translate-y-1/2 rounded-full bg-ambient-lime blur-[100px] opacity-10"
      />

      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 sm:mb-16 text-center">
          <p className="font-mono text-sm font-semibold uppercase tracking-[0.24em] text-muted">
            {t('title')}
          </p>
          <h2 className="mx-auto mt-4 text-3xl font-display font-medium leading-tight sm:text-4xl md:text-5xl text-foreground max-w-3xl">
            {t('subtitle')}
          </h2>
        </div>

        <FadeIn delay={0.2}>
          <SkillsOrbit />
        </FadeIn>
      </div>
    </section>
  )
}
