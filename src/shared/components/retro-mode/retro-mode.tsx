'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { Link } from '@/shared/config/i18n/navigation'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { getRetroCopy } from './retro-copy'

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

export function RetroTrigger({ label }: { label: string }) {
  const setActive = useRetroMode((state) => state.setActive)
  return (
    <button
      type="button"
      id="retro-trigger"
      className="retro-trigger"
      aria-label={label}
      title={label}
      onClick={() => {
        setActive(true)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }}
    >
      <FloppyDisk />
      <span className="retro-trigger-tooltip" aria-hidden="true">
        {label}
      </span>
    </button>
  )
}

export function RetroExperience({ locale }: { locale: string }) {
  const active = useRetroMode((state) => state.active)
  const init = useRetroMode((state) => state.init)
  const setActive = useRetroMode((state) => state.setActive)
  const exitButton = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const previouslyActive = useRef(false)
  const t = getRetroCopy(locale)

  useEffect(() => {
    init()
  }, [init])
  useEffect(() => {
    if (active) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement &&
        document.activeElement !== document.body &&
        !document.activeElement.closest('.retro-chrome')
          ? document.activeElement
          : null
      exitButton.current?.focus({ preventScroll: true })
    } else if (previouslyActive.current) {
      const target = returnFocus.current?.isConnected
        ? returnFocus.current
        : document.getElementById('main-content')
      target?.focus({ preventScroll: true })
    }
    previouslyActive.current = active
  }, [active])

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {active ? t.restored : ''}
      </div>
      <div className="retro-chrome retro-welcome">
        <div className="retro-titlebar">
          <span aria-hidden="true">▣</span>
          <span>ranielli_homepage.html — Internet Explorer</span>
          <span aria-hidden="true" className="retro-window-glyphs">
            _ □ ×
          </span>
        </div>
        <div className="retro-address">
          <span>Address</span> https://www.ranimontagna.com/
        </div>
        <div className="retro-welcome-content">
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
      </div>
      <div className="retro-chrome retro-taskbar">
        <button
          ref={exitButton}
          type="button"
          className="retro-exit"
          onClick={() => setActive(false)}
        >
          <FloppyDisk />
          <span>{t.exit}</span>
          <span aria-hidden="true">»</span>
        </button>
        <span className="retro-taskbar-page">ranielli_homepage.html</span>
        <span className="retro-online">
          <span aria-hidden="true">●</span> {t.online}
        </span>
      </div>
    </>
  )
}
