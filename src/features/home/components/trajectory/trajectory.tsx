import { getTranslations } from 'next-intl/server'
import type { CSSProperties } from 'react'
import { BrandIcon, Reveal, SECTION_X, SectionHeading, TechChip } from '@/shared/ui-2026'
import { STAGES, type Stage } from './trajectory.data'
import { TrajectoryScroller } from './trajectory-scroller'

function maskStyle(src: string, extra: CSSProperties): CSSProperties {
  const url = `url(${src})`
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    ...extra,
  }
}

/** The company logo in white, drawn through a mask so it never needs a photo. */
function CompanyLogo({ company, style }: { company: Stage['company']; style: CSSProperties }) {
  return (
    <span
      role="img"
      aria-label={company.name}
      data-company-logo
      className="block bg-white"
      style={maskStyle(company.logo, { aspectRatio: String(company.ratio), ...style })}
    />
  )
}

export async function Trajectory() {
  const t = await getTranslations('trajectory')
  const total = String(STAGES.length).padStart(2, '0')

  return (
    <section id="trajetoria" className={`${SECTION_X} bg-background py-24 sm:py-32`}>
      {/* Old anchors (#about, #experience) from links to the previous site land here. */}
      <span id="about" aria-hidden="true" />
      <span id="experience" aria-hidden="true" />
      <Reveal>
        <SectionHeading id="trajetoria" kicker={t('kicker')} title={t('title')} lead={t('lead')} />
      </Reveal>

      <TrajectoryScroller>
        <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <div aria-hidden="true" className="relative hidden lg:block">
            <div className="sticky top-24 aspect-[4/5] w-full overflow-hidden rounded-[2px]">
              {STAGES.map((stage, index) => (
                <div
                  key={stage.id}
                  data-stage-panel={stage.id}
                  data-active={index === 0 ? 'true' : 'false'}
                  className="group/panel absolute inset-0 flex flex-col opacity-0 transition-opacity duration-700 data-[active=true]:opacity-100"
                  style={{ backgroundColor: stage.company.color, zIndex: index + 1 }}
                >
                  <div className="flex flex-1 items-center justify-center p-[14%]">
                    <div className="w-full scale-90 transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-data-[active=true]/panel:scale-100">
                      <CompanyLogo
                        company={stage.company}
                        style={{
                          width: `${Math.min(80, Math.max(40, stage.company.ratio * 40))}%`,
                          margin: '0 auto',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-4 px-6 pb-6 text-white">
                    <span className="font-mono text-6xl leading-[0.8] font-semibold tracking-[-0.05em]">
                      {stage.year}
                    </span>
                    <span className="flex gap-3 text-white/70">
                      {stage.panelIcons.map((icon) => (
                        <BrandIcon key={icon} name={icon} className="h-5 w-5" />
                      ))}
                    </span>
                    <span className="font-mono text-xs tracking-[0.14em] text-white/70">
                      {String(index + 1).padStart(2, '0')} / {total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ol className="flex flex-col">
            {STAGES.map((stage, index) => (
              <li
                key={stage.id}
                data-stage={stage.id}
                data-active={index === 0 ? 'true' : 'false'}
                className="group flex flex-col gap-6 border-t border-line py-12 lg:min-h-[70svh]"
              >
                <div
                  data-stage-band={stage.id}
                  className="flex h-[92px] items-center justify-center rounded-[2px] lg:hidden"
                  style={{ backgroundColor: stage.company.color }}
                >
                  <CompanyLogo company={stage.company} style={{ height: 44, maxWidth: '70%' }} />
                </div>
                <span
                  data-year
                  className="font-mono text-[clamp(48px,7vw,104px)] leading-none font-semibold tracking-[-0.05em] text-muted transition-colors duration-500 group-data-[active=true]:text-accent"
                >
                  {stage.year}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {t(`stages.${stage.id}.role`)}
                  </h3>
                  <p className="font-mono text-xs text-muted">{t(`stages.${stage.id}.period`)}</p>
                </div>
                <p className="max-w-2xl text-lg leading-snug text-foreground">
                  {t(`stages.${stage.id}.what`)}
                </p>
                <ul className="flex flex-col gap-2">
                  {(t.raw(`stages.${stage.id}.impact`) as string[]).map((line) => (
                    <li key={line} className="flex gap-3 text-base text-foreground">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-wrap gap-2" aria-label={t('stackLabel')}>
                  {stage.stack.map((tech) => (
                    <li key={tech}>
                      <TechChip label={tech} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </TrajectoryScroller>
    </section>
  )
}
