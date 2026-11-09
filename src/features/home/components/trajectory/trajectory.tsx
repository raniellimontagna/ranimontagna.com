import { getTranslations } from 'next-intl/server'
import type { CSSProperties } from 'react'
import { BrandIcon, Reveal, SECTION_X, SectionHeading, TechChip } from '@/shared/ui-2026'
import { STAGES, STRIP_INK, type Stage } from './trajectory.data'
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

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** White text where it reads on the brand color (4.5:1), dark ink where it does not. */
function inkFor(color: string): string {
  return 1.05 / (luminance(color) + 0.05) >= 4.5 ? STRIP_INK.light : STRIP_INK.dark
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
                  className="group/panel absolute inset-0 z-0 flex flex-col opacity-0 transition-opacity duration-700 data-[active=true]:z-10 data-[active=true]:opacity-100 data-[active=false]:delay-700 motion-reduce:transition-none"
                  style={{ backgroundColor: stage.company.color }}
                >
                  <div className="flex flex-1 items-center justify-center p-[14%]">
                    <div className="w-full scale-90 transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-data-[active=true]/panel:scale-100 motion-reduce:transition-none">
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

          <div>
            {/* Below lg the desktop panel becomes a strip that sticks under the header
              and swaps color, logo and years with the stage. Strip or bands is decided at
              first paint (scripting media feature), so nothing shifts after mount;
              without script the per-stage bands below stay. The negative
              margin cancels the header offset, so it never covers the first stage. */}
            <div
              aria-hidden="true"
              data-stage-strip
              data-follow-header
              className="sticky top-0 z-10 -mt-16 mb-16 hidden h-16 overflow-hidden rounded-[2px] [@media(scripting:enabled)]:max-lg:block lg:hidden"
            >
              {STAGES.map((stage, index) => (
                <span
                  key={stage.id}
                  data-stage-panel={stage.id}
                  data-active={index === 0 ? 'true' : 'false'}
                  className="group/layer absolute inset-0 z-0 flex items-center justify-between gap-4 px-4 opacity-0 transition-opacity duration-500 data-[active=true]:z-10 data-[active=true]:opacity-100 data-[active=false]:delay-500 motion-reduce:transition-none"
                  style={{ backgroundColor: stage.company.color }}
                >
                  <span className="translate-y-[60%] transition-transform duration-500 group-data-[active=true]/layer:translate-y-0 group-data-[before=true]/layer:-translate-y-[60%] motion-reduce:transition-none">
                    <CompanyLogo company={stage.company} style={{ height: 26 }} />
                  </span>
                  <span
                    className="text-right font-mono"
                    style={{ color: inkFor(stage.company.color) }}
                  >
                    <span className="block text-[13px] font-semibold">
                      {stage.year} – {STAGES[index + 1]?.year ?? t('now')}
                    </span>
                    <span className="block text-xs">
                      {String(index + 1).padStart(2, '0')} / {total}
                    </span>
                  </span>
                </span>
              ))}
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
                    className="flex h-[92px] items-center justify-center rounded-[2px] [@media(scripting:enabled)]:hidden lg:hidden"
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
        </div>
      </TrajectoryScroller>
    </section>
  )
}
