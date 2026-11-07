import { ActionLink, PhotoReveal, Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'
import type { CaseStudy } from '../cases.data'

type CaseHeroProps = {
  study: CaseStudy
  labels: {
    name: string
    tagline: string
    heroAlt: string
    kicker: string
    live: string
    repo: string
  }
}

export function CaseHero({ study, labels }: CaseHeroProps) {
  return (
    <header className="pt-28 sm:pt-36">
      <Reveal className={`${SECTION_X} flex flex-col gap-6`}>
        <p data-reveal className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
          {labels.kicker}
        </p>
        <WordReveal
          as="h1"
          text={labels.name}
          className="text-[clamp(64px,13vw,220px)] leading-[0.85] font-semibold tracking-[-0.06em] text-foreground"
        />
        <p data-reveal className="max-w-2xl text-xl leading-snug text-foreground sm:text-2xl">
          {labels.tagline}
        </p>
        <div data-reveal className="flex flex-wrap gap-4">
          {study.liveUrl ? (
            <ActionLink href={study.liveUrl} external>
              {labels.live} · {study.liveUrl.replace('https://', '')}
            </ActionLink>
          ) : null}
          {study.repoUrl ? (
            <ActionLink href={study.repoUrl} variant="outline" external>
              {labels.repo}
            </ActionLink>
          ) : null}
        </div>
      </Reveal>
      <PhotoReveal
        src={study.hero.src}
        alt={labels.heroAlt}
        effect="scale"
        sizes="100vw"
        priority
        className="mt-16 aspect-[16/10] w-full border-y border-line"
      />
    </header>
  )
}
