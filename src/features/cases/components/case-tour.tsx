import { Reveal, SECTION_X, WordReveal } from '@/shared/ui-2026'
import type { CaseMedia, CaseStep } from '../cases.data'
import { BrowserFrame, DESK_SIZES, PHONE_SIZES, PhoneFrame, Screen } from './case-frames'
import { CaseTourScroller } from './case-tour-scroller'

export type TourCopy = { title: string; body: string; deskAlt: string; phoneAlt: string }

type CaseTourProps = {
  index: number
  kicker: string
  title: string
  body: string
  listLabel: string
  host: string
  steps: readonly CaseStep[]
  copy: (id: string) => TourCopy
}

const pad = (value: number) => String(value).padStart(2, '0')

/** Inactive screens wait clipped below; the active one wipes up over the last, then that one clears. */
const LAYER =
  'absolute inset-0 z-0 [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-700 ease-[cubic-bezier(0.7,0,0.2,1)] data-[active=false]:delay-700 data-[active=true]:z-10 data-[active=true]:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none'

function Layers({
  items,
  sizes,
}: {
  items: ReadonlyArray<{ media: CaseMedia; alt: string }>
  sizes: string
}) {
  return items.map((item, step) => (
    <div
      key={item.media.src}
      data-tour-screen
      data-step={step}
      data-active={step === 0}
      className={LAYER}
    >
      <Screen media={item.media} alt={item.alt} sizes={sizes} managed />
    </div>
  ))
}

/**
 * The product, screen by screen. A browser and a phone stay pinned while the
 * steps scroll past (on a phone, only the phone, under the header); each
 * step wipes its screens in. Without the script the stage is not there, and
 * each step shows its own pair of screens instead.
 */
export function CaseTour({
  index,
  kicker,
  title,
  body,
  listLabel,
  host,
  steps,
  copy,
}: CaseTourProps) {
  const desk = steps.map((step) => ({ media: step.screens.desk, alt: copy(step.id).deskAlt }))
  const phone = steps.map((step) => ({ media: step.screens.phone, alt: copy(step.id).phoneAlt }))

  return (
    <section className={`${SECTION_X} border-t border-line pt-20 sm:pt-28 lg:pb-8`}>
      <Reveal className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="flex flex-col gap-4">
          <p
            data-reveal
            className="flex items-baseline gap-4 font-mono text-xs tracking-[0.2em] text-accent uppercase"
          >
            <span className="text-muted">{pad(index)}</span>
            {kicker}
          </p>
          <WordReveal
            text={title}
            className="text-[clamp(36px,4.6vw,72px)] leading-[0.98] font-semibold tracking-[-0.035em] text-foreground"
          />
        </div>
        <p data-reveal className="text-lg leading-relaxed text-foreground lg:self-end">
          {body}
        </p>
      </Reveal>

      <CaseTourScroller
        total={steps.length}
        className="relative mt-10 lg:mt-0 lg:grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16"
      >
        <div
          data-tour-stage
          data-follow-header
          className="sticky top-0 z-10 hidden max-lg:-mt-16 max-lg:mb-16 [@media(scripting:enabled)]:block max-sm:-mx-4 max-sm:px-4 max-lg:bg-background max-lg:pt-4 max-lg:pb-3 sm:max-lg:-mx-8 sm:max-lg:px-8 lg:order-2 lg:self-start"
        >
          <div className="lg:flex lg:h-svh lg:items-center">
            <div className="relative w-full lg:pb-[12%]">
              <div data-stage-browser className="hidden lg:block lg:w-[88%]">
                <BrowserFrame host={host}>
                  <Layers items={desk} sizes={DESK_SIZES} />
                </BrowserFrame>
              </div>
              <div
                data-stage-phone
                className="mx-auto w-[min(52svh*390/844,62vw)] lg:absolute lg:right-0 lg:bottom-0 lg:w-[23%]"
              >
                <PhoneFrame>
                  <Layers items={phone} sizes={PHONE_SIZES} />
                </PhoneFrame>
              </div>
            </div>
          </div>
          <p
            data-tour-count
            aria-hidden="true"
            className="mt-3 text-center font-mono text-xs tracking-[0.14em] text-muted tabular-nums lg:hidden"
          >
            {`01 / ${pad(steps.length)}`}
          </p>
          {/* The steps slide under the pinned phone: a short fade, not a hard edge. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-full h-6 bg-gradient-to-b from-background to-transparent lg:hidden"
          />
        </div>

        <ol aria-label={listLabel} className="lg:order-1">
          {steps.map((step, i) => {
            const text = copy(step.id)
            return (
              <li
                key={step.id}
                data-tour-step
                data-step={i}
                data-active={i === 0}
                className="flex min-h-[70svh] flex-col gap-4 pt-8 transition-opacity duration-500 last:min-h-[60svh] lg:min-h-[85svh] lg:last:min-h-svh lg:justify-center lg:pt-0 [@media(scripting:enabled)]:lg:data-[active=false]:opacity-(--dim-body) motion-reduce:transition-none"
              >
                <span aria-hidden="true" className="font-mono text-xs tracking-[0.2em] text-accent">
                  {pad(i + 1)} / {pad(steps.length)}
                </span>
                <h3
                  data-tour-caption
                  className="text-[clamp(28px,3.2vw,48px)] leading-[1.02] font-semibold tracking-[-0.03em] text-foreground"
                >
                  {text.title}
                </h3>
                <p className="max-w-md text-lg leading-relaxed text-foreground">{text.body}</p>
                <div className="relative mt-6 pb-[40%] [@media(scripting:enabled)]:hidden">
                  <div className="w-[88%]">
                    <BrowserFrame host={host}>
                      <Screen media={step.screens.desk} alt={text.deskAlt} sizes={DESK_SIZES} />
                    </BrowserFrame>
                  </div>
                  <div className="absolute right-0 bottom-0 w-[30%]">
                    <PhoneFrame>
                      <Screen media={step.screens.phone} alt={text.phoneAlt} sizes={PHONE_SIZES} />
                    </PhoneFrame>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </CaseTourScroller>
    </section>
  )
}
