'use client'

import Image from 'next/image'
import { MagneticHover, ParallaxLayer } from '@/shared/components/animations'
import { TerminalWindow } from '@/shared/components/ui'

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <ParallaxLayer
        offset={34}
        className="absolute top-6 -left-6 h-28 w-28 rounded-full bg-ambient-lime blur-3xl"
      />
      <ParallaxLayer
        offset={42}
        className="absolute top-0 right-0 h-36 w-36 rounded-full bg-ambient-ice blur-3xl"
      />
      <ParallaxLayer
        offset={24}
        className="absolute right-8 bottom-18 h-16 w-16 rounded-full border border-line bg-surface"
      />

      <MagneticHover className="relative">
        <div className="surface-panel accent-glow relative isolate overflow-hidden rounded-3xl px-3 pt-3 pb-4 sm:rounded-4xl sm:px-5 sm:pt-5 sm:pb-6 md:px-6 md:pt-6 md:pb-7">
          <div className="atmospheric-grid absolute inset-0 opacity-45" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_48%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_52%)]" />

          <div className="relative mt-4 flex justify-center sm:mt-6 md:mt-8">
            <ParallaxLayer offset={24}>
              <div className="relative h-80 w-60 rounded-4xl border border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent)] p-2.5 shadow-(--shadow-panel) dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)] sm:h-96 sm:w-[18rem] sm:p-3 md:h-104 md:w-78">
                <div className="absolute inset-x-12 top-3 h-10 rounded-full bg-ambient-ice blur-2xl" />
                <div className="absolute inset-3 overflow-hidden rounded-[1.55rem] border border-line-strong bg-canvas">
                  <div className="absolute inset-0 glow-gradient-portrait" />
                  <Image
                    src="/images/pc-avatar.webp"
                    alt="Ranielli Montagna portrait"
                    fill
                    sizes="(max-width: 640px) 240px, (max-width: 768px) 288px, 312px"
                    quality={100}
                    className="object-cover object-center"
                    priority
                  />
                </div>

                <div className="absolute -top-3 right-4 rounded-full border border-line bg-surface-strong px-3 py-1 font-mono text-[0.68rem] font-semibold text-foreground shadow-(--shadow-soft)">
                  + web
                </div>
                <div className="absolute bottom-12 -left-4 rounded-full border border-line bg-surface-strong px-3 py-1 font-mono text-[0.68rem] font-semibold text-foreground shadow-(--shadow-soft)">
                  + mobile
                </div>
                <div className="absolute right-3 bottom-5 rounded-full border border-line bg-surface-strong px-3 py-1 font-mono text-[0.68rem] font-semibold text-foreground shadow-(--shadow-soft)">
                  + seo
                </div>
              </div>
            </ParallaxLayer>
          </div>

          <div className="relative mt-4 grid gap-2 sm:mt-6 sm:gap-3 md:mt-8 md:grid-cols-[1.1fr_0.9fr]">
            <TerminalWindow title="delivery.state" className="h-full">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 font-bold text-ballance">
                  <span>&gt;</span>
                  <span>stack --ship</span>
                </div>
                <p className="text-muted">
                  web, mobile, SEO tecnico, acessibilidade e performance.
                </p>
                <div className="flex items-center gap-2 font-bold text-balance">
                  <span>&gt;</span>
                  <span>status --ready</span>
                </div>
              </div>
            </TerminalWindow>
          </div>
        </div>
      </MagneticHover>
    </div>
  )
}
