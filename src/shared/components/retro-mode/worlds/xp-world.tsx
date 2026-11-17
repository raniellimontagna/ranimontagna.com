'use client'

import Image from 'next/image'
import { type MouseEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useRouter } from '@/shared/config/i18n/navigation'
import type { RetroMode } from '@/shared/store/use-retro-mode/retro-modes'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { WorldControls, type WorldProps } from './world-controls'
import { useBootOnce, useWorldClock, useWorldSound } from './world-hooks'
import { getWorldLabels } from './world-labels'
import { NOTE, playTones, type Tone } from './world-sound'
import {
  AboutApp,
  ContactApp,
  ProjectsApp,
  RecycleApp,
  RunDialog,
  type ShutdownChoice,
  ShutdownDialog,
} from './xp/xp-apps'
import { getXpCopy } from './xp/xp-copy'
import { StartSymbol, TrayIcon, XpIcon, type XpIconKind } from './xp/xp-icons'
import { XpBoot, XpSaving, XpStandBy } from './xp/xp-screens'
import { XpWindow } from './xp/xp-window'

type AppId = 'about' | 'projects' | 'contact' | 'recycle' | 'run'
type OpenWindow = { id: AppId; z: number; minimized: boolean; offset: number }
type Explorer = 'normal' | 'min' | 'max'
type Screen = null | 'shutdown' | 'saving-off' | 'saving-logoff' | 'welcome' | 'standby'
type IconKey = AppId | 'blog'

const SOUNDS: Record<'startup' | 'open' | 'error' | 'balloon' | 'off', Tone[]> = {
  startup: [
    { f: NOTE.G4, at: 0, d: 1.6, v: 0.035 },
    { f: NOTE.C5, at: 0, d: 0.7, type: 'triangle', v: 0.06 },
    { f: NOTE.G5, at: 0.14, d: 0.7, type: 'triangle', v: 0.05 },
    { f: NOTE.E5, at: 0.28, d: 0.7, type: 'triangle', v: 0.05 },
    { f: NOTE.C6, at: 0.46, d: 1.3, type: 'triangle', v: 0.055 },
    { f: NOTE.E6, at: 0.46, d: 1.1, v: 0.02 },
  ],
  open: [
    { f: NOTE.E5, at: 0, d: 0.06, type: 'square', v: 0.018 },
    { f: NOTE.A5, at: 0.05, d: 0.09, type: 'square', v: 0.014 },
  ],
  error: [
    { f: NOTE.A4, at: 0, d: 0.4, type: 'triangle', v: 0.08 },
    { f: NOTE.E5, at: 0, d: 0.25, v: 0.03 },
  ],
  balloon: [
    { f: NOTE.G5, at: 0, d: 0.12, v: 0.035 },
    { f: NOTE.C6, at: 0.09, d: 0.22, v: 0.035 },
  ],
  off: [
    { f: NOTE.C6, at: 0, d: 0.5, type: 'triangle', v: 0.05 },
    { f: NOTE.G5, at: 0.16, d: 0.5, type: 'triangle', v: 0.05 },
    { f: NOTE.E5, at: 0.32, d: 0.5, type: 'triangle', v: 0.05 },
    { f: NOTE.C5, at: 0.5, d: 1.1, type: 'triangle', v: 0.05 },
  ],
}

const WIDTHS: Record<AppId, number> = {
  about: 420,
  projects: 580,
  contact: 480,
  recycle: 440,
  run: 400,
}

const RUN_TARGETS: Record<string, AppId | RetroMode | `/${string}` | 'resume'> = {
  sobre: 'about',
  about: 'about',
  notepad: 'about',
  'bloco de notas': 'about',
  projetos: 'projects',
  projects: 'projects',
  proyectos: 'projects',
  explorer: 'projects',
  contato: 'contact',
  contact: 'contact',
  contacto: 'contact',
  email: 'contact',
  outlook: 'contact',
  lixeira: 'recycle',
  recycle: 'recycle',
  papelera: 'recycle',
  blog: '/blog',
  iexplore: '/blog',
  inicio: '/',
  home: '/',
  cv: 'resume',
  curriculo: 'resume',
  curriculum: 'resume',
  resume: 'resume',
  cmd: 'dos',
  'cmd.exe': 'dos',
  command: 'dos',
  dos: 'dos',
  mac: 'mac',
  gameboy: 'gameboy',
  jornal: 'newspaper',
  newspaper: 'newspaper',
  gazeta: 'newspaper',
  code: 'ide',
  vscode: 'ide',
  ide: 'ide',
  win98: '1998',
  1998: '1998',
}

/** The same PDFs as the site's résumé links (kept here so the icon set stays out of this chunk). */
const RESUME = {
  pt: { href: '/cv/pt.pdf', filename: 'Curriculo-Ranielli-Montagna.pdf' },
  en: { href: '/cv/en.pdf', filename: 'Resume-Ranielli-Montagna.pdf' },
  es: { href: '/cv/es.pdf', filename: 'Curriculum-Ranielli-Montagna.pdf' },
} as const

const APP_IDS: readonly AppId[] = ['about', 'projects', 'contact', 'recycle', 'run']
const MODES: readonly RetroMode[] = ['1998', 'xp', 'dos', 'gameboy', 'newspaper', 'ide', 'mac']

function normalize(value: string) {
  return value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function XpWorld({ locale, onExit }: WorldProps) {
  const labels = getWorldLabels(locale)
  const copy = getXpCopy(locale)
  const router = useRouter()
  const setMode = useRetroMode((state) => state.setMode)
  const resume = RESUME[locale === 'en' || locale === 'es' ? locale : 'pt']
  const clock = useWorldClock(locale)
  const sound = useWorldSound()
  const boot = useBootOnce('xp')

  const [startOpen, setStartOpen] = useState(false)
  const [windows, setWindows] = useState<OpenWindow[]>([])
  const [explorer, setExplorer] = useState<Explorer>('normal')
  const [screen, setScreen] = useState<Screen>(null)
  const [balloon, setBalloon] = useState<null | 'mouse' | 'touch'>(null)
  const [selected, setSelected] = useState<ReadonlySet<IconKey>>(new Set())
  const [band, setBand] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const startButton = useRef<HTMLButtonElement>(null)
  const startMenu = useRef<HTMLElement>(null)
  const desktop = useRef<HTMLDivElement>(null)
  const bandStart = useRef<{ x: number; y: number } | null>(null)
  const topZ = useRef(70)

  const icons: { key: IconKey; icon: XpIconKind; label: string }[] = [
    { key: 'about', icon: 'computer', label: labels.about },
    { key: 'projects', icon: 'folder', label: labels.projects },
    { key: 'blog', icon: 'notebook', label: labels.blog },
    { key: 'contact', icon: 'mail', label: labels.contact },
    { key: 'recycle', icon: 'recycle', label: copy.recycle },
  ]
  const titles: Record<AppId, { title: string; icon: XpIconKind }> = {
    about: { title: copy.aboutTitle, icon: 'notepad' },
    projects: { title: copy.projectsTitle, icon: 'folder' },
    contact: { title: copy.contactTitle, icon: 'mail' },
    recycle: { title: copy.recycle, icon: 'recycle' },
    run: { title: copy.runTitle, icon: 'run' },
  }

  const focusWindow = useCallback((id: AppId) => {
    topZ.current += 1
    const z = topZ.current
    setWindows((list) => list.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)))
  }, [])

  const openApp = useCallback((id: AppId) => {
    setStartOpen(false)
    topZ.current += 1
    const z = topZ.current
    setWindows((list) => {
      if (list.some((w) => w.id === id))
        return list.map((w) => (w.id === id ? { ...w, z, minimized: false } : w))
      playTones(SOUNDS.open)
      return [...list, { id, z, minimized: false, offset: list.length }]
    })
  }, [])

  const closeApp = useCallback((id: AppId) => {
    setWindows((list) => list.filter((w) => w.id !== id))
  }, [])

  const closeAll = useCallback(() => {
    setWindows([])
    setStartOpen(false)
  }, [])

  // The page under the Explorer frame is the real site: minimize hides it, maximize widens it.
  useEffect(() => {
    const root = document.documentElement
    if (explorer === 'normal') root.removeAttribute('data-xp-explorer')
    else root.setAttribute('data-xp-explorer', explorer)
  }, [explorer])
  useEffect(() => {
    const root = document.documentElement
    if (screen === 'shutdown') root.setAttribute('data-xp-dim', 'true')
    else root.removeAttribute('data-xp-dim')
  }, [screen])
  useEffect(
    () => () => {
      document.documentElement.removeAttribute('data-xp-explorer')
      document.documentElement.removeAttribute('data-xp-dim')
    },
    [],
  )

  // A tip from the tray once the desktop is ready, once per session.
  useEffect(() => {
    if (!boot.ready || boot.booting || screen) return
    let shown = false
    try {
      shown = sessionStorage.getItem('retro-xp-balloon') === '1'
      sessionStorage.setItem('retro-xp-balloon', '1')
    } catch {
      shown = false
    }
    if (shown) return
    const show = window.setTimeout(() => {
      setBalloon(window.matchMedia?.('(pointer: coarse)').matches ? 'touch' : 'mouse')
      playTones(SOUNDS.balloon)
    }, 1400)
    const hide = window.setTimeout(() => setBalloon(null), 11_000)
    return () => {
      window.clearTimeout(show)
      window.clearTimeout(hide)
    }
  }, [boot.ready, boot.booting, screen])

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
    const closeOutside = (event: globalThis.PointerEvent | FocusEvent) => {
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

  function activate(key: IconKey) {
    if (key === 'blog') {
      router.push('/blog')
      return
    }
    openApp(key)
  }

  function onIconClick(event: MouseEvent<HTMLButtonElement>, key: IconKey) {
    // A keyboard press (detail 0) or a tap opens at once; a mouse needs a double-click.
    const touch = (event.nativeEvent as globalThis.PointerEvent).pointerType === 'touch'
    if (event.detail === 0 || touch || window.matchMedia?.('(pointer: coarse)').matches) {
      activate(key)
      return
    }
    setSelected(new Set([key]))
  }

  function startBand(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.target !== event.currentTarget) return
    setSelected(new Set())
    bandStart.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveBand(event: PointerEvent<HTMLDivElement>) {
    const origin = bandStart.current
    if (!origin) return
    const rect = {
      x: Math.min(origin.x, event.clientX),
      y: Math.min(origin.y, event.clientY),
      w: Math.abs(event.clientX - origin.x),
      h: Math.abs(event.clientY - origin.y),
    }
    setBand(rect)
    const hit = new Set<IconKey>()
    for (const node of desktop.current?.querySelectorAll<HTMLElement>('[data-xp-icon]') ?? []) {
      const r = node.getBoundingClientRect()
      if (
        r.right > rect.x &&
        r.left < rect.x + rect.w &&
        r.bottom > rect.y &&
        r.top < rect.y + rect.h
      )
        hit.add(node.dataset.xpIcon as IconKey)
    }
    setSelected(hit)
  }

  function endBand() {
    bandStart.current = null
    setBand(null)
  }

  function run(value: string): string | null {
    const typed = normalize(value)
    if (!typed) return null
    const target = RUN_TARGETS[typed]
    if (!target) {
      playTones(SOUNDS.error)
      return copy.runError(value.trim())
    }
    closeApp('run')
    if (target === 'resume') window.open(resume.href, '_blank', 'noopener')
    else if (target.startsWith('/')) router.push(target)
    else if ((APP_IDS as readonly string[]).includes(target)) openApp(target as AppId)
    else if ((MODES as readonly string[]).includes(target)) {
      setMode(target as RetroMode)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    return null
  }

  function chooseShutdown(choice: ShutdownChoice) {
    if (choice === 'standby') setScreen('standby')
    else if (choice === 'off') {
      playTones(SOUNDS.off)
      closeAll()
      setScreen('saving-off')
    } else {
      closeAll()
      setScreen(null)
      boot.replay()
    }
  }

  const finishBoot = useCallback(() => {
    boot.finish()
    playTones(SOUNDS.startup)
  }, [boot.finish])
  const finishWelcome = useCallback(() => {
    setScreen(null)
    playTones(SOUNDS.startup)
  }, [])
  const finishLogoff = useCallback(() => setScreen('welcome'), [])
  const wake = useCallback(() => setScreen(null), [])

  const destinations = [
    { icon: 'computer' as const, label: labels.about, href: '/#about' },
    { icon: 'folder' as const, label: labels.projects, href: '/projects' },
    { icon: 'notebook' as const, label: labels.blog, href: '/blog' },
    { icon: 'mail' as const, label: labels.contact, href: '/#contact' },
  ]

  return (
    <>
      <div
        ref={desktop}
        className="xp-desktop"
        onPointerDown={startBand}
        onPointerMove={moveBand}
        onPointerUp={endBand}
        onPointerCancel={endBand}
      >
        <div className="xp-desktop-signature" aria-hidden="true">
          <span>Ranielli</span>
          <strong>
            Montagna <small>xp</small>
          </strong>
          <p>{copy.edition}</p>
        </div>
        <nav className="xp-desktop-icons" aria-label={copy.desktop}>
          {icons.map((item) => (
            <button
              key={item.key}
              type="button"
              data-xp-icon={item.key}
              className="xp-desktop-icon"
              aria-pressed={selected.has(item.key)}
              onClick={(event) => onIconClick(event, item.key)}
              onDoubleClick={() => activate(item.key)}
            >
              <XpIcon kind={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {band ? (
        <span
          className="xp-band"
          aria-hidden="true"
          style={{ left: band.x, top: band.y, width: band.w, height: band.h }}
        />
      ) : null}

      <div className="xp-explorer-titlebar">
        <span className="xp-explorer-title-icon" aria-hidden="true">
          <XpIcon kind="computer" />
        </span>
        <span>{copy.explorer}</span>
        <button
          type="button"
          className="xp-titlebutton"
          aria-label={`${copy.minimize} — Explorer`}
          onClick={() => setExplorer('min')}
        >
          <span aria-hidden="true">_</span>
        </button>
        <button
          type="button"
          className="xp-titlebutton"
          aria-label={`${explorer === 'max' ? copy.restore : copy.maximize} — Explorer`}
          onClick={() => setExplorer((state) => (state === 'max' ? 'normal' : 'max'))}
        >
          <span aria-hidden="true">{explorer === 'max' ? '❐' : '□'}</span>
        </button>
        <button
          type="button"
          className="xp-window-close"
          aria-label={`${labels.exit} — Explorer`}
          onClick={onExit}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {windows.map((w) => {
        const meta = titles[w.id]
        const top = Math.max(...windows.filter((o) => !o.minimized).map((o) => o.z))
        return (
          <XpWindow
            key={w.id}
            title={meta.title}
            icon={meta.icon}
            z={w.z}
            offset={w.offset}
            width={WIDTHS[w.id]}
            focused={w.z === top}
            minimized={w.minimized}
            labels={copy}
            onFocus={() => focusWindow(w.id)}
            onMinimize={() =>
              setWindows((list) => list.map((o) => (o.id === w.id ? { ...o, minimized: true } : o)))
            }
            onClose={() => closeApp(w.id)}
          >
            {w.id === 'about' ? (
              <AboutApp copy={copy} onNavigate={closeAll} />
            ) : w.id === 'projects' ? (
              <ProjectsApp copy={copy} locale={locale} onNavigate={closeAll} />
            ) : w.id === 'contact' ? (
              <ContactApp copy={copy} onSent={() => closeApp('contact')} />
            ) : w.id === 'recycle' ? (
              <RecycleApp copy={copy} onNope={() => playTones(SOUNDS.error)} />
            ) : (
              <RunDialog copy={copy} onRun={run} onCancel={() => closeApp('run')} />
            )}
          </XpWindow>
        )
      })}

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
          <div className="xp-start-columns">
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
            <div className="xp-start-places">
              <button type="button" onClick={() => openApp('about')}>
                <XpIcon kind="computer" size={24} />
                <span>{copy.computer}</span>
              </button>
              <a href={resume.href} download={resume.filename} onClick={() => setStartOpen(false)}>
                <XpIcon kind="docs" size={24} />
                <span>{copy.resume}</span>
              </a>
              <button type="button" onClick={() => openApp('recycle')}>
                <XpIcon kind="recycle" size={24} />
                <span>{copy.recycle}</span>
              </button>
              <button type="button" onClick={() => openApp('run')}>
                <XpIcon kind="run" size={24} />
                <span>{copy.run}</span>
              </button>
            </div>
          </div>
          <div className="xp-start-footer">
            <button
              type="button"
              onClick={() => {
                setStartOpen(false)
                closeAll()
                setScreen('saving-logoff')
              }}
            >
              <XpIcon kind="logoff" size={22} />
              {copy.logOff}
            </button>
            <button
              type="button"
              onClick={() => {
                setStartOpen(false)
                setScreen('shutdown')
              }}
            >
              <XpIcon kind="power" size={22} />
              {copy.turnOff}
            </button>
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
        <div className="xp-tasks">
          <button
            type="button"
            className="xp-task"
            aria-pressed={explorer !== 'min'}
            onClick={() => setExplorer((state) => (state === 'min' ? 'normal' : 'min'))}
          >
            <XpIcon kind="computer" size={20} />
            <span>{copy.explorer}</span>
          </button>
          {windows.map((w) => (
            <button
              key={w.id}
              type="button"
              className="xp-task"
              aria-pressed={!w.minimized}
              onClick={() =>
                w.minimized
                  ? focusWindow(w.id)
                  : setWindows((list) =>
                      list.map((o) => (o.id === w.id ? { ...o, minimized: true } : o)),
                    )
              }
            >
              <XpIcon kind={titles[w.id].icon} size={20} />
              <span>{titles[w.id].title}</span>
            </button>
          ))}
        </div>
        <div className="xp-tray">
          <button
            type="button"
            className="xp-tray-button"
            aria-pressed={sound.on}
            aria-label={sound.on ? copy.soundOn : copy.soundOff}
            title={sound.on ? copy.soundOn : copy.soundOff}
            onClick={sound.toggle}
          >
            <TrayIcon kind={sound.on ? 'speaker' : 'muted'} />
          </button>
          <span className="xp-tray-network">
            <TrayIcon kind="network" />
          </span>
          <time className="xp-clock">{clock}</time>
          {balloon ? (
            <div className="xp-balloon" role="status">
              <button
                type="button"
                className="xp-balloon-close"
                aria-label={copy.close}
                onClick={() => setBalloon(null)}
              >
                ×
              </button>
              <strong>
                <XpIcon kind="computer" size={16} /> {copy.balloonTitle}
              </strong>
              <p>{balloon === 'touch' ? copy.balloonTouch : copy.balloonText}</p>
            </div>
          ) : null}
        </div>
        <WorldControls locale={locale} onExit={onExit} />
      </div>

      {screen === 'shutdown' ? (
        <ShutdownDialog copy={copy} onChoose={chooseShutdown} onCancel={() => setScreen(null)} />
      ) : null}
      {screen === 'standby' ? <XpStandBy hint={copy.wake} onWake={wake} /> : null}
      {screen === 'saving-off' ? <XpSaving text={copy.saving} onDone={onExit} /> : null}
      {screen === 'saving-logoff' ? (
        <XpSaving text={copy.loggingOff} onDone={finishLogoff} />
      ) : null}
      {screen === 'welcome' ? (
        <XpBoot copy={copy} startAt="welcome" onDone={finishWelcome} />
      ) : null}
      {boot.booting && !screen ? <XpBoot copy={copy} onDone={finishBoot} /> : null}
    </>
  )
}
