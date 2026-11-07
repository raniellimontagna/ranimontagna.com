import { getTranslations } from 'next-intl/server'
import { StaticImage } from '@/shared/components/ui/static-image/static-image'
import { AttoLogo, PhotoReveal, Reveal, SECTION_X, SectionHeading } from '@/shared/ui-2026'
import { STAGES, type StageLogo } from './trajectory.data'
import { TrajectoryScroller } from './trajectory-scroller'

function Logo({ logo }: { logo: StageLogo }) {
  // Brand logos keep their own colors on a white plate in both themes.
  return (
    <span className="inline-flex h-12 items-center rounded-[2px] bg-white px-3">
      {logo.kind === 'atto' ? (
        <AttoLogo className="h-5 w-auto text-black" />
      ) : (
        // biome-ignore lint/performance/noImgElement: tiny static logos, no optimization needed.
        <img
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className="h-7 w-auto"
        />
      )}
    </span>
  )
}

export async function Trajectory() {
  const t = await getTranslations('trajectory')

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
            <div className="sticky top-24 aspect-[4/5] w-full overflow-hidden rounded-[2px] bg-surface">
              {STAGES.map((stage, index) => (
                <div
                  key={stage.id}
                  data-stage-photo={stage.id}
                  data-active={index === 0 ? 'true' : 'false'}
                  className="absolute inset-0 opacity-0 data-[active=true]:opacity-100"
                  style={{ zIndex: index + 1 }}
                >
                  <StaticImage
                    src={stage.photo.src}
                    alt=""
                    fill
                    sizes="40vw"
                    className="object-cover object-top"
                  />
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
                <PhotoReveal
                  src={stage.photo.src}
                  alt={t(`stages.${stage.id}.photoAlt`)}
                  effect="mask"
                  sizes="100vw"
                  className="aspect-[16/10] w-full lg:hidden"
                />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span
                    data-year
                    className="font-mono text-[clamp(48px,7vw,104px)] leading-none font-semibold tracking-[-0.05em] text-muted transition-colors duration-500 group-data-[active=true]:text-accent"
                  >
                    {stage.year}
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {stage.logos.map((logo) => (
                      <Logo key={logo.kind === 'atto' ? 'atto' : logo.src} logo={logo} />
                    ))}
                  </span>
                </div>
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
                    <li
                      key={tech}
                      className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted"
                    >
                      {tech}
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
