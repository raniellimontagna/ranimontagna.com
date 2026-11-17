'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/shared/config/i18n/navigation'
import { RETRO_MODES, type RetroMode } from '@/shared/store/use-retro-mode/retro-modes'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { getRetroCopy } from '../retro-copy'
import { RETRO_NAMES } from '../retro-secret'
import { getWeb98Copy } from './web98/web98-copy'
import { DialUp, Guestbook, SparkleTrail, useMidi, VisitorCounter } from './web98/web98-parts'
import type { WorldProps } from './world-controls'
import { useBootOnce, useWorldClock, useWorldSound } from './world-hooks'
import { playTones, type Tone } from './world-sound'

const CLICK: Tone[] = [{ f: 1900, at: 0, d: 0.025, type: 'square', v: 0.012 }]

function FloppyDisk() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M3 2h15l3 3v17H3z" fill="currentColor" />
      <path d="M6 2h11v8H6z" fill="#c0c0c0" />
      <path d="M13 3h3v5h-3z" fill="#292959" />
      <path d="M6 13h12v9H6z" fill="#fff" />
      <path d="M8 16h8M8 19h8" stroke="#555" />
    </svg>
  )
}

function Speaker({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M2 6h3l4-3v10l-4-3H2z" fill="#000" />
      {on ? (
        <path d="M11 5c1.5 1.5 1.5 4.5 0 6M13 3c3 3 3 7 0 10" stroke="#000" fill="none" />
      ) : (
        <path d="m11 5 4 6m0-6-4 6" stroke="#c00000" strokeWidth="1.6" />
      )}
    </svg>
  )
}

function lastUpdated(locale: string) {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  return locale === 'en' ? `${month}/${day}/1998` : `${day}/${month}/1998`
}

/**
 * The 1998 homepage: the real site restyled underneath, an Internet Explorer
 * window on top with a dial-up connection, a marquee, a hit counter, a webring
 * through the other worlds and a guestbook, plus a Windows 98 taskbar.
 */
export function Web98World({ locale, onExit }: WorldProps) {
  const t = getRetroCopy(locale)
  const copy = getWeb98Copy(locale)
  const router = useRouter()
  const setMode = useRetroMode((state) => state.setMode)
  const clock = useWorldClock(locale)
  const sound = useWorldSound()
  const midi = useMidi(sound.on)
  const boot = useBootOnce('1998')
  const [collapsed, setCollapsed] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [guestbook, setGuestbook] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [updated, setUpdated] = useState('')
  const guestbookOpener = useRef<HTMLElement | null>(null)

  useEffect(() => setUpdated(lastUpdated(locale)), [locale])

  // The status bar shows where a link goes, and every link clicks like 1998.
  useEffect(() => {
    const linkOf = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null
    const show = (event: Event) => {
      const link = linkOf(event.target)
      setStatus(link ? copy.shortcut(link.href) : null)
    }
    const click = (event: MouseEvent) => {
      if (linkOf(event.target)) playTones(CLICK)
    }
    document.addEventListener('mouseover', show)
    document.addEventListener('focusin', show)
    document.addEventListener('click', click)
    return () => {
      document.removeEventListener('mouseover', show)
      document.removeEventListener('focusin', show)
      document.removeEventListener('click', click)
    }
  }, [copy])

  const order = RETRO_MODES
  const here = order.indexOf('1998')
  const previous = order[(here - 1 + order.length) % order.length]
  const next = order[(here + 1) % order.length]

  const visit = useCallback(
    (mode: RetroMode) => {
      setMode(mode)
      window.scrollTo({ top: 0, behavior: 'instant' })
    },
    [setMode],
  )

  function visitRandom() {
    const others = order.filter((mode) => mode !== '1998')
    visit(others[Math.floor(Math.random() * others.length)])
  }

  function openGuestbook() {
    guestbookOpener.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setGuestbook(true)
  }

  function closeGuestbook() {
    setGuestbook(false)
    guestbookOpener.current?.focus({ preventScroll: true })
  }

  const finishDial = boot.finish

  return (
    <>
      {boot.booting ? <DialUp copy={copy} onDone={finishDial} onCancel={onExit} /> : null}
      <SparkleTrail />
      <div className="retro-chrome retro-welcome" data-w98-collapsed={collapsed || undefined}>
        <div className="retro-titlebar">
          <span aria-hidden="true">▣</span>
          <span>ranielli_homepage.html — Internet Explorer</span>
          <button
            type="button"
            className="w98-titlebutton"
            aria-label={collapsed ? copy.restore : copy.minimize}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            <span aria-hidden="true">{collapsed ? '□' : '_'}</span>
          </button>
          <button
            type="button"
            className="w98-titlebutton"
            aria-label={copy.close}
            onClick={onExit}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {collapsed ? null : (
          <>
            <div className="w98-toolbar" role="toolbar" aria-label={copy.toolbar}>
              <button type="button" onClick={() => window.history.back()}>
                <span aria-hidden="true">←</span>
                <span>{copy.back}</span>
              </button>
              <button type="button" onClick={() => window.history.forward()}>
                <span aria-hidden="true">→</span>
                <span>{copy.forward}</span>
              </button>
              <button
                type="button"
                aria-pressed={stopped}
                onClick={() => {
                  setStopped((value) => !value)
                  midi.stop()
                }}
              >
                <span aria-hidden="true">✕</span>
                <span>{copy.stop}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStopped(false)
                  boot.replay()
                }}
              >
                <span aria-hidden="true">⟳</span>
                <span>{copy.refresh}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push('/')
                  window.scrollTo({ top: 0, behavior: 'instant' })
                }}
              >
                <span aria-hidden="true">⌂</span>
                <span>{copy.home}</span>
              </button>
              <button type="button" onClick={openGuestbook}>
                <span aria-hidden="true">✎</span>
                <span>{copy.guestbook}</span>
              </button>
            </div>
            <div className="retro-address">
              <span>{copy.address}</span> https://www.ranimontagna.com/
            </div>
            <div className="retro-welcome-content">
              <div className="w98-marquee" data-stopped={stopped || undefined}>
                <p>{updated ? copy.marquee(updated) : ''}</p>
              </div>
              <p className="retro-web-label">~ {t.web} ~</p>
              <div className="retro-welcome-heading">
                <Image
                  src="/images/avatar-112.webp"
                  alt="Ranielli Montagna"
                  width={72}
                  height={72}
                  className="retro-portrait"
                />
                <div>
                  <p className="retro-welcome-title">{t.welcome}</p>
                  <p>{t.intro}</p>
                </div>
              </div>
              <hr className="w98-rainbow" />
              <nav aria-label="Homepage 1998" className="retro-navigation">
                <Link href="/">{t.home}</Link>
                <span aria-hidden="true"> | </span>
                <Link href="/projects">{t.projects}</Link>
                <span aria-hidden="true"> | </span>
                <Link href="/blog" prefetch={false}>
                  {t.blog}
                </Link>
                <span aria-hidden="true"> | </span>
                <Link href="/#contact">{t.contact}</Link>
                <span aria-hidden="true"> | </span>
                <button type="button" className="w98-link" onClick={openGuestbook}>
                  {copy.guestbook}
                </button>{' '}
                <span className="w98-new" data-stopped={stopped || undefined}>
                  {copy.newBadge}
                </span>
              </nav>
              <div className="retro-construction">
                <Image
                  src="/retro/construction.gif"
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="retro-construction-moving"
                />
                <Image
                  src="/retro/construction.png"
                  alt=""
                  width={32}
                  height={32}
                  className="retro-construction-still"
                />
                <strong>{t.construction}</strong>
              </div>
              <p className="retro-construction-note">{t.note}</p>
              <VisitorCounter label={copy.visitor} />
              <nav className="w98-webring" aria-label={copy.webring}>
                <p>{copy.webring}</p>
                <div>
                  <button type="button" className="w98-button" onClick={() => visit(previous)}>
                    « {copy.previous}: {RETRO_NAMES[previous]}
                  </button>
                  <button type="button" className="w98-button" onClick={visitRandom}>
                    {copy.random}
                  </button>
                  <button type="button" className="w98-button" onClick={() => visit(next)}>
                    {copy.next}: {RETRO_NAMES[next]} »
                  </button>
                </div>
              </nav>
              <div className="retro-badges">
                <span className="retro-badge retro-badge-web">
                  WWW
                  <br />
                  PERSONAL HOME PAGE
                </span>
                <span className="retro-badge retro-badge-handmade">
                  &lt;/&gt;
                  <br />
                  {t.handmade}
                </span>
                <span className="retro-badge retro-badge-screen">
                  ▣<br />
                  {t.bestViewed}
                </span>
              </div>
            </div>
            <div className="w98-statusbar">
              <span>{status ?? copy.done}</span>
              <span>
                <span aria-hidden="true">◍</span> {copy.zone}
              </span>
            </div>
          </>
        )}
      </div>
      {guestbook ? <Guestbook copy={copy} locale={locale} onClose={closeGuestbook} /> : null}
      <div className="retro-chrome retro-taskbar">
        <button data-retro-exit type="button" className="retro-exit" onClick={onExit}>
          <FloppyDisk />
          <span>{t.exit}</span>
          <span aria-hidden="true">»</span>
        </button>
        <span className="retro-taskbar-page">ranielli_homepage.html</span>
        <span className="w98-tray">
          <button
            type="button"
            className="w98-tray-button"
            aria-pressed={midi.playing}
            aria-label={midi.playing ? copy.midiStop : copy.midiPlay}
            title={midi.playing ? copy.midiStop : copy.midiPlay}
            onClick={() => {
              if (!sound.on) sound.toggle()
              midi.toggle()
            }}
          >
            <span aria-hidden="true">♫</span>
          </button>
          <button
            type="button"
            className="w98-tray-button"
            aria-label={sound.on ? copy.soundOn : copy.soundOff}
            title={sound.on ? copy.soundOn : copy.soundOff}
            onClick={sound.toggle}
          >
            <Speaker on={sound.on} />
          </button>
          <span className="w98-clock">{clock}</span>
        </span>
      </div>
    </>
  )
}
