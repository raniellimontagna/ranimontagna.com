import { LG_QUERY } from '@/shared/components/motion'
import { ActionLink, Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'
import { type CaseStudy, caseHost } from '../cases.data'
import { BrowserFrame, DESK_SIZES, PHONE_SIZES, PhoneFrame, Screen } from './case-frames'
import { CaseStage } from './case-stage'

type CaseHeroProps = {
  study: CaseStudy
  labels: {
    name: string
    tagline: string
    heroAlt: string
    heroPhoneAlt: string
    kicker: string
    live: string
    repo: string
  }
}

export function CaseHero({ study, labels }: CaseHeroProps) {
  const host = caseHost(study)

  return (
    <header className="overflow-x-clip pt-28 sm:pt-36">
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
          <ActionLink href={study.liveUrl} external>
            {labels.live} · {host}
          </ActionLink>
          {study.repoUrl ? (
            <ActionLink href={study.repoUrl} variant="outline" external>
              {labels.repo}
            </ActionLink>
          ) : null}
        </div>
      </Reveal>

      <div className={`${SECTION_X} mt-12 sm:mt-16 lg:mt-12`}>
        {/* The phone hangs below the browser: the padding is its room. */}
        <CaseStage className="relative mx-auto max-w-[1240px] pb-[58%] lg:pb-[12%]">
          <div data-stage-browser className="w-[90%] lg:w-[86%]">
            <BrowserFrame host={host}>
              <Screen
                media={study.hero.desk}
                alt={labels.heroAlt}
                sizes={DESK_SIZES}
                priority
                videoQuery={LG_QUERY}
              />
            </BrowserFrame>
          </div>
          <div
            data-stage-phone
            className="absolute right-[2%] bottom-0 w-[42%] lg:right-[1%] lg:w-[21%]"
          >
            <PhoneFrame>
              <Screen media={study.hero.phone} alt={labels.heroPhoneAlt} sizes={PHONE_SIZES} />
            </PhoneFrame>
          </div>
        </CaseStage>
      </div>
    </header>
  )
}
