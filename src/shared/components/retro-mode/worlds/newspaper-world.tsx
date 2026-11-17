'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/shared/components/motion'
import { Link } from '@/shared/config/i18n/navigation'
import { getNewspaperCopy, type NewspaperCopy } from './newspaper/newspaper-copy'
import { WorldControls, type WorldProps } from './world-controls'
import { useBootOnce, useSkippableTimer } from './world-hooks'
import { getWorldLabels } from './world-labels'
import { playTones, type Tone } from './world-sound'

const THUMP: Tone[] = [
  { f: 90, at: 0, d: 0.18, type: 'triangle', v: 0.08 },
  { f: 70, at: 0.02, d: 0.25, v: 0.05 },
]
const BELL: Tone[] = [
  { f: 2093, at: 0, d: 0.5, v: 0.03 },
  { f: 4186, at: 0, d: 0.25, v: 0.008 },
]
const TYPE_MS = 45
const HOLD_MS = 5200

function clack(): Tone[] {
  return [{ f: 1800 + Math.random() * 900, at: 0, d: 0.012, type: 'square', v: 0.008 }]
}

/** The front page spins in like an old film's breaking-news shot, then lands. */
function SpinningFrontPage({ copy, onDone }: { copy: NewspaperCopy; onDone: () => void }) {
  useSkippableTimer(true, 2600, onDone)
  useEffect(() => {
    const land = window.setTimeout(() => playTones(THUMP), 1250)
    return () => window.clearTimeout(land)
  }, [])
  return (
    <div className="newspaper-spin" aria-hidden="true">
      <div className="newspaper-spin-page">
        <p className="newspaper-spin-extra">{copy.extra}</p>
        <p className="newspaper-spin-name">Gazeta Montagna</p>
        <p className="newspaper-spin-headline">{copy.headlines[0]}</p>
        <div className="newspaper-spin-columns">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

/** Types each headline letter by letter, rings the bell, holds, then the next one. */
function useTypewriter(headlines: readonly string[], paused: boolean) {
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(0)
  const [animate, setAnimate] = useState(false)
  const text = headlines[index]

  useEffect(() => setAnimate(!prefersReducedMotion()), [])

  useEffect(() => {
    if (!animate || paused) return
    if (shown < text.length) {
      const timer = window.setTimeout(() => {
        setShown((value) => value + 1)
        if (text[shown] !== ' ') playTones(clack())
      }, TYPE_MS)
      return () => window.clearTimeout(timer)
    }
    playTones(BELL)
    const timer = window.setTimeout(() => {
      setIndex((value) => (value + 1) % headlines.length)
      setShown(0)
    }, HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [animate, paused, shown, text, headlines.length])

  const next = () => {
    setIndex((value) => (value + 1) % headlines.length)
    setShown(0)
  }
  return {
    text,
    typed: animate ? text.slice(0, shown) : text,
    typing: animate && shown < text.length,
    next,
  }
}

export function NewspaperWorld({ locale, onExit }: WorldProps) {
  const t = getWorldLabels(locale)
  const copy = getNewspaperCopy(locale)
  const boot = useBootOnce('newspaper')
  const headline = useTypewriter(copy.headlines, boot.booting || !boot.ready)
  const [today, setToday] = useState('')
  const [backPage, setBackPage] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const date = new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
    setToday(date)
    setBackPage(document.body)
  }, [locale])

  return (
    <>
      {boot.booting ? <SpinningFrontPage copy={copy} onDone={boot.finish} /> : null}
      <div className="newspaper-masthead">
        <div className="newspaper-edition">
          <span>{copy.edition}</span>
          <span>{today ? `PARAÍ · ${today}` : 'PARAÍ · RS · BRASIL'}</span>
        </div>
        <div className="newspaper-title-row">
          <p className="newspaper-ear">
            <strong>{copy.forecast}</strong>
            <span aria-hidden="true"> ☀ </span>
            {copy.weather}
          </p>
          <p className="newspaper-name">Gazeta Montagna</p>
          <p className="newspaper-ear">
            <strong>{copy.number}</strong>
            {copy.price}
          </p>
        </div>
        <p className="newspaper-motto">{copy.motto}</p>
        <nav aria-label="Gazeta Montagna" className="newspaper-nav">
          <Link href="/">{t.home}</Link>
          <Link href="/#about">{t.about}</Link>
          <Link href="/projects">{t.projects}</Link>
          <Link href="/blog" prefetch={false}>
            {t.blog}
          </Link>
          <Link href="/#contact">{t.contact}</Link>
        </nav>
        <div className="newspaper-ticker">
          <strong>{copy.latest}</strong>
          <div className="newspaper-ticker-track">
            <p>
              {[...copy.ticker, ...copy.ticker].map((item, index) => (
                <span key={index} aria-hidden={index >= copy.ticker.length || undefined}>
                  {item}
                </span>
              ))}
            </p>
          </div>
        </div>
        <div className="newspaper-headline">
          <p>
            <span className="sr-only">{headline.text}</span>
            <span aria-hidden="true">
              {headline.typed}
              {headline.typing ? <span className="newspaper-caret">▌</span> : null}
            </span>
          </p>
          <button type="button" className="newspaper-next" onClick={headline.next}>
            {copy.nextHeadline} ›
          </button>
        </div>
      </div>
      {backPage
        ? createPortal(
            <section className="newspaper-classifieds" aria-labelledby="newspaper-classifieds">
              <h2 id="newspaper-classifieds">{copy.classifieds}</h2>
              <div>
                {copy.ads.map((ad) => (
                  <article key={ad.title}>
                    <h3>{ad.title}</h3>
                    <p>{ad.text}</p>
                    {ad.href.startsWith('/') ? (
                      <Link href={ad.href}>{ad.cta} ›</Link>
                    ) : (
                      <a
                        href={ad.href}
                        {...(ad.href.startsWith('http')
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                      >
                        {ad.cta} ›
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>,
            backPage,
          )
        : null}
      <div className="newspaper-bottom">
        <span>GAZETA MONTAGNA · {copy.edition}</span>
        <WorldControls locale={locale} onExit={onExit} />
      </div>
    </>
  )
}
