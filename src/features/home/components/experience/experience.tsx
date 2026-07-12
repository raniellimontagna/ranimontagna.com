import { AltArrowLeft, AltArrowRight, Buildings, Calendar, MapPoint } from '@solar-icons/react/ssr'
import { useTranslations } from 'next-intl'
import { type CSSProperties, Fragment } from 'react'
import { FadeIn, RevealText } from '@/shared/components/animations'
import { CompanyMark } from './company-mark'
import { experiences } from './experience.static'
import { ExperienceCylinderScroll } from './experience-cylinder-scroll'
import { ExperienceMobileCarouselGestures } from './experience-mobile-carousel-gestures'

export function Experience() {
  const t = useTranslations('experience')
  const items = experiences(t)
  const mobileCarouselRules = items
    .map(
      (_, index) => `
            [data-experience-cylinder-stage="true"]:has([data-experience-mobile-input="${index}"]:checked) [data-experience-mobile-slide="true"][data-experience-index="${index}"] {
              animation: experience-mobile-slide-in 340ms cubic-bezier(0.22, 1, 0.36, 1);
              display: grid;
            }

            [data-experience-cylinder-stage="true"]:has([data-experience-mobile-input="${index}"]:checked) [data-experience-mobile-dot="true"][data-experience-index="${index}"] {
              background: color-mix(in srgb, var(--accent) 82%, var(--background));
              border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
              color: var(--background);
            }

            [data-experience-cylinder-stage="true"]:has([data-experience-mobile-input="${index}"]:checked) [data-experience-mobile-arrow][data-experience-index="${index}"] {
              display: inline-flex;
            }
      `,
    )
    .join('\n')

  return (
    <section id="experience" className="relative overflow-hidden py-14 sm:py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10 atmospheric-grid opacity-50" />
      <div className="absolute top-1/3 left-0 -z-10 h-125 w-125 -translate-x-1/2 rounded-full bg-accent-ice/14 blur-[140px]" />
      <div className="absolute top-1/2 right-0 -z-10 h-125 w-125 translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />

      <ExperienceCylinderScroll />
      <ExperienceMobileCarouselGestures />
      <div className="section-shell relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <style>{`
          @keyframes experience-mobile-slide-in {
            from {
              opacity: 0;
              transform: translate3d(0.75rem, 0, 0) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @keyframes experience-mobile-slide-in-reverse {
            from {
              opacity: 0;
              transform: translate3d(-0.75rem, 0, 0) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translate3d(0, 0, 0) scale(1);
            }
          }

          @media (max-width: 1023px) {
            [data-experience-mobile-slide="true"] {
              display: none;
            }

            [data-experience-mobile-slide="true"][data-active="true"] {
              display: grid;
            }

            [data-experience-mobile-dot="true"][data-active="true"] {
              background: color-mix(in srgb, var(--accent) 82%, var(--background));
              border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
              color: var(--background);
            }

            [data-experience-mobile-arrow] {
              display: none;
            }

            [data-experience-mobile-arrow][data-active="true"] {
              display: inline-flex;
            }

            [data-experience-mobile-gesture-zone="true"] {
              touch-action: pan-y;
            }

            [data-experience-mobile-gesture-zone="true"][data-experience-mobile-dragging="true"] {
              cursor: grabbing;
            }

            [data-experience-mobile-carousel="true"][data-experience-mobile-swipe-direction="previous"] [data-experience-mobile-slide="true"][data-active="true"] {
              animation-name: experience-mobile-slide-in-reverse;
            }

            @supports selector(:has(*)) {
              [data-experience-cylinder-stage="true"] [data-experience-mobile-slide="true"] {
                display: none;
              }

              [data-experience-cylinder-stage="true"] [data-experience-mobile-dot="true"] {
                background: var(--surface);
                border-color: var(--line);
                color: var(--muted);
              }

              [data-experience-cylinder-stage="true"] [data-experience-mobile-arrow] {
                display: none;
              }

              ${mobileCarouselRules}

              [data-experience-mobile-carousel="true"][data-experience-mobile-swipe-direction="previous"] [data-experience-mobile-slide="true"][data-active="true"] {
                animation-name: experience-mobile-slide-in-reverse;
              }
            }
          }

          @media (min-width: 1024px) {
            [data-experience-cylinder-stage="true"][data-experience-enhanced="true"] [data-experience-panel-slot="true"] {
              display: block;
              position: relative;
            }

            [data-experience-cylinder-stage="true"][data-experience-enhanced="true"] [data-experience-panel="true"] {
              inset: 0;
              opacity: 0;
              pointer-events: none;
              position: absolute;
              transform: translate3d(0, 1rem, 0) scale(0.985);
              transition:
                border-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
                opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
                transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
                visibility 280ms step-end;
              visibility: hidden;
            }

            [data-experience-cylinder-stage="true"][data-experience-enhanced="true"] [data-experience-panel="true"][data-active="true"] {
              border-color: color-mix(in srgb, var(--accent) 48%, var(--line));
              opacity: 1;
              pointer-events: auto;
              transform: translate3d(0, 0, 0) scale(1);
              transition:
                border-color 280ms cubic-bezier(0.22, 1, 0.36, 1),
                opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
                transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
                visibility 0ms;
              visibility: visible;
            }

            [data-experience-cylinder="true"] {
              transform-style: preserve-3d;
            }

            [data-experience-cylinder-card="true"] {
              opacity: 0.42;
              transform: translate(-50%, -50%) rotateY(var(--card-angle)) translateZ(10.25rem);
              transition:
                opacity 260ms cubic-bezier(0.22, 1, 0.36, 1),
                filter 260ms cubic-bezier(0.22, 1, 0.36, 1);
            }

            [data-experience-cylinder-card="true"][data-active="true"] {
              filter: saturate(1.08);
              opacity: 1;
            }

            [data-experience-control="true"][data-active="true"] {
              border-color: color-mix(in srgb, var(--accent) 50%, var(--line));
              color: var(--foreground);
              opacity: 1;
            }

            [data-experience-panel-mark="true"],
            [data-experience-panel-heading="true"],
            [data-experience-panel-meta="true"],
            [data-experience-panel-body="true"],
            [data-experience-panel-highlight="true"],
            [data-experience-panel-tech="true"] {
              will-change: opacity, transform;
            }
          }
        `}</style>

        <div
          className="grid gap-8 sm:gap-10 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12 xl:gap-16"
          data-experience-cylinder-stage="true"
          data-experience-pinned-stage="true"
        >
          <div className="min-w-0 lg:h-fit" data-experience-intro="true">
            <FadeIn delay={0.15}>
              <div className="editorial-kicker mb-6">
                <Buildings className="h-4 w-4" />
                {t('badge')}
              </div>
            </FadeIn>

            <RevealText
              text={`${t('title.part1')} ${t('title.part2')}`}
              className="max-w-xl font-heading text-3xl font-semibold tracking-[-0.08em] text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
            />

            <FadeIn delay={0.35}>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:mt-6 sm:leading-8 sm:text-lg">
                {t('subtitle')}
              </p>
            </FadeIn>

            <FadeIn delay={0.4} blur>
              <fieldset
                className="mt-7 min-w-0 max-w-full border-0 p-0 [min-inline-size:0] lg:hidden"
                data-experience-mobile-carousel="true"
              >
                <legend className="sr-only">{t('badge')}</legend>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                    {t('badge')}
                  </p>
                  <p className="font-mono text-[11px] text-muted">
                    {String(items.length).padStart(2, '0')}
                  </p>
                </div>

                {items.map((_, index) => (
                  <input
                    key={`experience-mobile-input-${index}`}
                    id={`experience-mobile-${index}`}
                    type="radio"
                    name="experience-mobile-company"
                    className="sr-only"
                    defaultChecked={index === 0}
                    data-experience-mobile-input={index}
                  />
                ))}

                <div className="mb-3 flex min-h-10 items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {items.map((exp, index) => (
                      <label
                        key={exp.company}
                        htmlFor={`experience-mobile-${index}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-[10px] font-semibold text-muted transition duration-300 ease-out focus-within:ring-3 focus-within:ring-ring"
                        data-experience-mobile-dot="true"
                        data-experience-index={index}
                        data-active={index === 0}
                        aria-label={`${exp.company} - ${exp.period}`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {items.map((_, index) => {
                      const previousIndex = (index - 1 + items.length) % items.length
                      const nextIndex = (index + 1) % items.length

                      return (
                        <Fragment key={`experience-mobile-arrows-${index}`}>
                          <label
                            htmlFor={`experience-mobile-${previousIndex}`}
                            className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-muted transition duration-300 ease-out hover:border-accent/50 hover:text-foreground"
                            data-experience-mobile-arrow="prev"
                            data-experience-index={index}
                            data-active={index === 0}
                            aria-label={`${items[previousIndex]?.company ?? ''} - ${
                              items[previousIndex]?.period ?? ''
                            }`}
                          >
                            <AltArrowLeft className="h-4 w-4" />
                          </label>
                          <label
                            htmlFor={`experience-mobile-${nextIndex}`}
                            className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-muted transition duration-300 ease-out hover:border-accent/50 hover:text-foreground"
                            data-experience-mobile-arrow="next"
                            data-experience-index={index}
                            data-active={index === 0}
                            aria-label={`${items[nextIndex]?.company ?? ''} - ${
                              items[nextIndex]?.period ?? ''
                            }`}
                          >
                            <AltArrowRight className="h-4 w-4" />
                          </label>
                        </Fragment>
                      )
                    })}
                  </div>
                </div>

                <div
                  className="relative min-h-[34rem] cursor-grab overflow-hidden rounded-[1.6rem] border border-line bg-surface-strong shadow-card active:cursor-grabbing"
                  data-experience-mobile-gesture-zone="true"
                  data-experience-mobile-viewport="true"
                >
                  {items.map((exp, index) => (
                    <article
                      key={exp.company}
                      className="relative min-h-[34rem] content-start overflow-hidden p-5"
                      data-experience-mobile-slide="true"
                      data-experience-index={index}
                      data-active={index === 0}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_78%_18%] from-accent/16 via-transparent to-transparent" />
                      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />

                      <div className="relative flex items-start justify-between gap-4">
                        <span className="h-18 w-18" />
                        <CompanyMark logo={exp.logo} company={exp.company} alt="" />
                        <span className="font-mono text-[11px] text-muted">
                          {String(index + 1).padStart(2, '0')} /{' '}
                          {String(items.length).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="relative mt-6 min-w-0" data-experience-mobile-details="true">
                        <h3 className="text-xl font-semibold tracking-[-0.04em] text-foreground">
                          {exp.position}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted">
                          <span className="font-semibold text-foreground">{exp.company}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {exp.period}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPoint className="h-3.5 w-3.5" />
                            {exp.location}
                          </span>
                        </div>

                        <p className="mt-5 text-base leading-7 text-muted">{exp.description}</p>

                        <div className="mt-6 grid gap-5">
                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                              {t('highlightsTitle')}
                            </p>
                            <div className="mt-3 grid gap-2">
                              {exp.highlights.map((highlight) => (
                                <div
                                  key={highlight}
                                  className="rounded-xl border border-line bg-surface px-3 py-2 text-sm leading-5 text-foreground"
                                >
                                  {highlight}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                              {t('technologiesTitle')}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {exp.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </fieldset>
            </FadeIn>

            <FadeIn delay={0.45} blur>
              <div
                className="relative mt-8 hidden min-h-96 overflow-hidden rounded-[2rem] border border-line bg-surface-strong/72 p-6 shadow-panel lg:block"
                style={{ perspective: '1100px' }}
              >
                <div className="absolute inset-0 bg-radial-[circle_at_50%_42%] from-accent/14 via-transparent to-transparent" />
                <div className="absolute inset-x-8 top-8 h-px bg-linear-to-r from-transparent via-line to-transparent" />

                <div
                  className="relative mx-auto mt-2 h-70 w-full max-w-sm"
                  data-experience-cylinder="true"
                  aria-hidden="true"
                >
                  {items.map((exp, index) => (
                    <div
                      key={exp.company}
                      className="absolute top-1/2 left-1/2 w-40 rounded-3xl border border-line bg-background/88 p-4 shadow-panel backdrop-blur"
                      style={
                        {
                          '--card-angle': `${(360 / items.length) * index}deg`,
                        } as CSSProperties
                      }
                      data-experience-cylinder-card="true"
                      data-experience-index={index}
                    >
                      <CompanyMark logo={exp.logo} company={exp.company} alt="" />
                      <p className="mt-4 text-sm font-semibold text-foreground">{exp.company}</p>
                      <p className="mt-1 text-xs leading-5 text-muted">{exp.period}</p>
                    </div>
                  ))}
                </div>

                <div className="relative mt-5 grid gap-2">
                  {items.map((exp, index) => (
                    <button
                      key={exp.company}
                      type="button"
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2 text-left text-sm text-muted opacity-78 outline-none transition focus-visible:ring-3 focus-visible:ring-ring"
                      data-experience-control="true"
                      data-experience-index={index}
                      aria-label={`${exp.company} - ${exp.period}`}
                      aria-pressed={index === 0}
                    >
                      <span className="font-mono text-[11px] text-muted">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate font-semibold">{exp.company}</span>
                      <span className="h-2 w-2 rounded-full bg-accent/70" />
                    </button>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          <div
            className="hidden min-w-0 gap-5 lg:relative lg:grid lg:min-h-[37rem]"
            data-experience-panel-slot="true"
            data-experience-panels="true"
            aria-live="polite"
          >
            {items.map((exp, index) => (
              <article
                key={exp.company}
                className="surface-panel-strong relative min-w-0 overflow-hidden rounded-2xl border border-line p-5 shadow-card sm:rounded-3xl sm:p-6 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:overscroll-contain lg:p-7"
                data-experience-panel="true"
                data-experience-index={index}
                data-active={index === 0}
              >
                <div className="absolute top-0 right-0 h-34 w-34 rounded-full bg-accent/12 blur-3xl" />

                <div className="relative grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
                  <div data-experience-panel-mark="true">
                    <CompanyMark
                      logo={exp.logo}
                      company={exp.company}
                      alt={t('logoAlt', { company: exp.company })}
                    />
                  </div>

                  <div className="min-w-0">
                    <div
                      className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
                      data-experience-panel-heading="true"
                    >
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                          {String(index + 1).padStart(2, '0')} /{' '}
                          {String(items.length).padStart(2, '0')}
                        </p>
                        <h3 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-foreground sm:text-2xl">
                          {exp.position}
                        </h3>
                      </div>

                      {exp.current && (
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          </span>
                          {t('currentLabel')}
                        </span>
                      )}
                    </div>

                    <div
                      className="mt-3 flex flex-wrap gap-2 text-sm text-muted"
                      data-experience-panel-meta="true"
                    >
                      <span className="font-semibold text-foreground">{exp.company}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {exp.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPoint className="h-3.5 w-3.5" />
                        {exp.location}
                      </span>
                    </div>

                    <p
                      className="mt-5 max-w-3xl text-base leading-7 text-muted"
                      data-experience-panel-body="true"
                    >
                      {exp.description}
                    </p>

                    <div className="mt-6 grid gap-5">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                          {t('highlightsTitle')}
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {exp.highlights.map((highlight) => (
                            <div
                              key={highlight}
                              className="rounded-xl border border-line bg-surface px-3 py-2 text-sm leading-5 text-foreground"
                              data-experience-panel-highlight="true"
                            >
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                          {t('technologiesTitle')}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {exp.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-foreground"
                              data-experience-panel-tech="true"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
