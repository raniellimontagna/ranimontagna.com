'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/shared/config/i18n/navigation'
import { WorldControls, type WorldProps } from './world-controls'
import { getWorldLabels } from './world-labels'

const xpCopy = {
  pt: {
    start: 'Iniciar',
    startMenu: 'Menu Iniciar',
    desktop: 'Área de trabalho',
    edition: 'Edição pessoal',
    explorer: 'Portfólio — Explorer',
  },
  en: {
    start: 'Start',
    startMenu: 'Start menu',
    desktop: 'Desktop',
    edition: 'Personal edition',
    explorer: 'Portfolio — Explorer',
  },
  es: {
    start: 'Inicio',
    startMenu: 'Menú Inicio',
    desktop: 'Escritorio',
    edition: 'Edición personal',
    explorer: 'Portafolio — Explorer',
  },
}

type DesktopIcon = 'computer' | 'folder' | 'notebook' | 'mail'

function XpIcon({ kind }: { kind: DesktopIcon }) {
  return (
    <svg viewBox="0 0 64 64" width="52" height="52" fill="none" aria-hidden="true">
      <title>{kind}</title>
      {kind === 'computer' ? (
        <>
          <path d="M8 5h46v36H8z" fill="#dbe6f5" stroke="#1e4587" strokeWidth="2" />
          <path d="M13 10h36v25H13z" fill="#155bbd" />
          <path d="M14 31 29 14l20 11v10H14z" fill="#79b963" />
          <path d="M14 11h34v7L14 31z" fill="#82c9fa" opacity=".55" />
          <path d="M26 42h12v9H26z" fill="#abbad1" stroke="#1e4587" />
          <path d="M18 49h28v6H18zM8 58h47l4 4H4z" fill="#e9edf1" stroke="#1e4587" />
          <path d="M12 60h39" stroke="#8799b3" strokeDasharray="3 2" />
        </>
      ) : kind === 'folder' ? (
        <>
          <path d="M5 18V12h21l6 6h24v37H5z" fill="#e5a620" stroke="#985e09" strokeWidth="2" />
          <path d="M5 23h55l-7 32H5z" fill="#ffdc65" stroke="#985e09" strokeWidth="2" />
          <path d="M8 26h48l-2 6H8z" fill="#fff3b2" />
          <path d="M9 48h40" stroke="#e6b338" strokeWidth="2" />
        </>
      ) : kind === 'notebook' ? (
        <>
          <path d="M14 5h40v54H14z" fill="#f9fcff" stroke="#2a5785" strokeWidth="2" />
          <path d="M13 5h6v54h-6z" fill="#4281bc" />
          <path
            d="M10 14h10M10 24h10M10 34h10M10 44h10M10 54h10"
            stroke="#bec8d6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M26 16h20M26 25h20M26 34h20M26 43h14" stroke="#84b9dc" strokeWidth="2" />
          <path d="m37 49 17-17 6 6-17 17-8 2z" fill="#f6be39" stroke="#926618" />
          <path d="m54 32 4-4 6 6-4 4z" fill="#e8898f" stroke="#a64f57" />
        </>
      ) : (
        <>
          <path d="M4 17h56v37H4z" fill="#fff8d3" stroke="#a77b23" strokeWidth="2" />
          <path d="m5 51 21-18M59 51 38 33" stroke="#d9b965" strokeWidth="2" />
          <path d="m5 18 27 22 27-22" fill="#fffceb" stroke="#a77b23" strokeWidth="2" />
          <path d="M45 5h14v14H45z" fill="#408ddd" stroke="#245ba0" />
          <path d="m47 10 4 3 5-5" stroke="#fff" strokeWidth="2" />
        </>
      )}
    </svg>
  )
}

function StartSymbol() {
  return (
    <svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
      <title>Start</title>
      <path d="m2 4 10-2v10L2 13z" fill="#f35b42" />
      <path d="m14 2 11 2v9l-11-1z" fill="#81cf49" />
      <path d="m2 15 10-1v10L2 26z" fill="#56b5f0" />
      <path d="m14 14 11 1v11l-11-2z" fill="#ffdc54" />
    </svg>
  )
}

export function XpWorld({ locale, onExit }: WorldProps) {
  const labels = getWorldLabels(locale)
  const copy = xpCopy[locale as keyof typeof xpCopy] ?? xpCopy.pt
  const [startOpen, setStartOpen] = useState(false)
  const startButton = useRef<HTMLButtonElement>(null)
  const startMenu = useRef<HTMLElement>(null)
  const destinations = [
    { icon: 'computer' as const, label: labels.about, href: '/#about' },
    { icon: 'folder' as const, label: labels.projects, href: '/projects' },
    { icon: 'notebook' as const, label: labels.blog, href: '/blog' },
    { icon: 'mail' as const, label: labels.contact, href: '/#contact' },
  ]

  useEffect(() => {
    if (!startOpen) return

    startMenu.current?.querySelector<HTMLAnchorElement>('a')?.focus()

    const isInsideDisclosure = (target: EventTarget | null) =>
      target instanceof Node &&
      (startMenu.current?.contains(target) || startButton.current?.contains(target))

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !isInsideDisclosure(event.target)) return
      setStartOpen(false)
      startButton.current?.focus()
    }
    const closeOutside = (event: PointerEvent | FocusEvent) => {
      if (!(event.target instanceof Node) || isInsideDisclosure(event.target)) return
      setStartOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('focusin', closeOutside)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('focusin', closeOutside)
    }
  }, [startOpen])

  return (
    <>
      <div className="xp-desktop">
        <div className="xp-desktop-signature" aria-hidden="true">
          <span>Ranielli</span>
          <strong>
            Montagna <small>xp</small>
          </strong>
          <p>{copy.edition}</p>
        </div>
        <nav className="xp-desktop-icons" aria-label={copy.desktop}>
          {destinations.map((destination) => (
            <Link
              key={destination.href}
              href={destination.href}
              locale={locale}
              prefetch={false}
              className="xp-desktop-icon"
            >
              <XpIcon kind={destination.icon} />
              <span>{destination.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="xp-explorer-titlebar">
        <span className="xp-explorer-title-icon" aria-hidden="true">
          <XpIcon kind="computer" />
        </span>
        <span>{copy.explorer}</span>
        <button
          type="button"
          className="xp-window-close"
          aria-label={`${labels.exit} — Explorer`}
          onClick={onExit}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {startOpen ? (
        <nav
          ref={startMenu}
          id="xp-start-menu"
          className="xp-start-menu"
          aria-label={copy.startMenu}
        >
          <div className="xp-start-user">
            <Image src="/images/avatar-112.webp" alt="" width={44} height={44} />
            <strong>Ranielli Montagna</strong>
          </div>
          <div className="xp-start-links">
            <Link href="/" locale={locale} prefetch={false} onClick={() => setStartOpen(false)}>
              <XpIcon kind="computer" />
              <span>{labels.home}</span>
            </Link>
            {destinations.map((destination) => (
              <Link
                key={destination.href}
                href={destination.href}
                locale={locale}
                prefetch={false}
                onClick={() => setStartOpen(false)}
              >
                <XpIcon kind={destination.icon} />
                <span>{destination.label}</span>
              </Link>
            ))}
          </div>
          <div className="xp-start-footer" aria-hidden="true">
            Ranielli Montagna · XP
          </div>
        </nav>
      ) : null}

      <div className="xp-taskbar">
        <button
          ref={startButton}
          type="button"
          className="xp-start"
          aria-expanded={startOpen}
          aria-controls="xp-start-menu"
          onClick={() => setStartOpen((open) => !open)}
        >
          <StartSymbol />
          <span>{copy.start}</span>
        </button>
        <span className="xp-taskbar-window" aria-hidden="true">
          <XpIcon kind="computer" />
          <span>{copy.explorer}</span>
        </span>
        <WorldControls locale={locale} onExit={onExit} />
      </div>
    </>
  )
}
