'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { usePathname, useRouter } from '@/shared/config/i18n/navigation'
import type { RetroMode } from '@/shared/store/use-retro-mode/retro-modes'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { RETRO_NAMES } from '../retro-secret'
import { CodeLine } from './ide/ide-code'
import { getIdeCopy, getIdeFiles, type IdeFile } from './ide/ide-copy'
import { CommandPalette, IdeTerminal, type PaletteItem } from './ide/ide-parts'
import { WorldControls, type WorldProps } from './world-controls'
import { useBootOnce } from './world-hooks'
import { getWorldLabels } from './world-labels'

const WORLDS: RetroMode[] = ['1998', 'xp', 'dos', 'gameboy', 'newspaper', 'mac']

function fileForRoute(files: IdeFile[], pathname: string, hash: string) {
  const route = pathname.startsWith('/projects')
    ? '/projects'
    : pathname.startsWith('/blog')
      ? '/blog'
      : hash === '#about'
        ? '/#about'
        : hash === '#contact'
          ? '/#contact'
          : '/'
  return files.find((file) => file.route === route) ?? files[0]
}

function FileIcon({ name }: { name: string }) {
  const kind = name.endsWith('.json') ? 'json' : name.endsWith('.ts') ? 'ts' : 'md'
  return (
    <span className={`ide-file-icon ide-file-icon-${kind}`} aria-hidden="true">
      {kind === 'json' ? '{}' : kind === 'ts' ? 'TS' : 'M↓'}
    </span>
  )
}

export function IdeWorld({ locale, onExit }: WorldProps) {
  const pathname = usePathname()
  const router = useRouter()
  const setMode = useRetroMode((state) => state.setMode)
  const labels = getWorldLabels(locale)
  const copy = getIdeCopy(locale)
  const files = useMemo(() => getIdeFiles(locale), [locale])
  const boot = useBootOnce('ide')
  const [tabs, setTabs] = useState<string[]>([files[0].name])
  const [active, setActive] = useState(files[0].name)
  const [shown, setShown] = useState<number | null>(null)
  const [palette, setPalette] = useState(false)
  const typed = useRef(new Set<string>())
  const terminalCommand = useRef<((command: string) => void) | null>(null)
  const paletteOpener = useRef<HTMLElement | null>(null)

  const file = files.find((item) => item.name === active) ?? files[0]
  const total = file.lines.reduce((sum, line) => sum + line.length + 1, 0)

  const open = useCallback((name: string) => {
    setTabs((list) => (list.includes(name) ? list : [...list, name]))
    setActive(name)
  }, [])

  // Follow the site: the page you are on is the file that is open.
  useEffect(() => {
    const sync = () => open(fileForRoute(files, pathname, window.location.hash).name)
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [files, pathname, open])

  // A file's first opening types it out, as if the code were being written.
  useEffect(() => {
    if (typed.current.has(active)) {
      setShown(null)
      return
    }
    typed.current.add(active)
    if (prefersReducedMotion()) {
      setShown(null)
      return
    }
    const step = Math.max(2, Math.ceil(total / 70))
    let value = 0
    setShown(0)
    const timer = window.setInterval(() => {
      value += step
      if (value >= total) {
        window.clearInterval(timer)
        setShown(null)
      } else setShown(value)
    }, 16)
    return () => window.clearInterval(timer)
  }, [active, total])

  function close(name: string) {
    setTabs((list) => {
      const next = list.filter((item) => item !== name)
      if (name === active) setActive(next.at(-1) ?? files[0].name)
      return next.length ? next : [files[0].name]
    })
  }

  const openPalette = useCallback(() => {
    paletteOpener.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setPalette(true)
  }, [])

  const closePalette = useCallback(() => {
    setPalette(false)
    paletteOpener.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if ((mod && ['p', 'P', 'k', 'K'].includes(event.key)) || event.key === 'F1') {
        event.preventDefault()
        openPalette()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPalette])

  const paletteItems: PaletteItem[] = [
    ...files.map((item) => ({
      id: `file-${item.name}`,
      label: item.name,
      detail: item.language,
      run: () => open(item.name),
    })),
    {
      id: 'dev',
      label: `> ${copy.runDev}`,
      run: () => terminalCommand.current?.('npm run dev'),
    },
    { id: 'clear', label: `> ${copy.clear}`, run: () => terminalCommand.current?.('clear') },
    ...(['/#about', '/projects', '/blog', '/#contact'] as const).map((route) => ({
      id: `go-${route}`,
      label: `> ${copy.goTo}: ${
        route === '/#about'
          ? labels.about
          : route === '/projects'
            ? labels.projects
            : route === '/blog'
              ? labels.blog
              : labels.contact
      }`,
      run: () => router.push(route),
    })),
    ...WORLDS.map((mode) => ({
      id: `world-${mode}`,
      label: `> ${copy.goTo}: ${RETRO_NAMES[mode]}`,
      run: () => {
        setMode(mode)
        window.scrollTo({ top: 0, behavior: 'instant' })
      },
    })),
    { id: 'exit', label: `> ${labels.exit}`, run: onExit },
  ]

  let budget = shown ?? Number.POSITIVE_INFINITY
  const visible = file.lines.map((line) => {
    const slice = line.slice(0, Math.max(0, budget))
    const done = budget >= line.length
    budget -= line.length + 1
    return { slice, done, started: budget + line.length + 1 > 0 }
  })
  const cursorLine =
    shown === null ? file.lines.length : visible.findIndex((line) => !line.done) + 1

  return (
    <>
      <div className="ide-top">
        <span aria-hidden="true">&lt;/&gt;</span>
        <span>ranimontagna.com — Code</span>
        <button type="button" className="ide-palette-button" onClick={openPalette}>
          <span aria-hidden="true">⌕</span> {copy.paletteButton}
          <kbd>⌘P</kbd>
        </button>
        <span>Ranielli Montagna</span>
      </div>
      <div className="ide-workbench">
        <nav aria-label="Explorer" className="ide-explorer">
          <p>{copy.explorer.toUpperCase()}</p>
          <strong>⌄ RANIMONTAGNA.COM</strong>
          {files.map((item) => (
            <button
              type="button"
              key={item.name}
              aria-current={active === item.name ? 'true' : undefined}
              onClick={() => open(item.name)}
            >
              <FileIcon name={item.name} />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="ide-editor">
          <div className="ide-tabs" role="tablist" aria-label={copy.editor}>
            {tabs.map((name) => (
              <div key={name} className="ide-tab" data-active={name === active || undefined}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={name === active}
                  onClick={() => setActive(name)}
                >
                  <FileIcon name={name} />
                  {name}
                </button>
                <button
                  type="button"
                  className="ide-tab-close"
                  aria-label={`${copy.closeTab} ${name}`}
                  onClick={() => close(name)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            ))}
          </div>
          <p className="ide-breadcrumb">
            portfolio › src › <span>{file.name}</span>
          </p>
          <div className="ide-code" role="tabpanel" aria-label={file.name}>
            <ol className="ide-lines">
              {visible.map((line, index) =>
                line.started || shown === null ? (
                  <li key={index} data-current={index + 1 === cursorLine || undefined}>
                    <span className="ide-line-number" aria-hidden="true">
                      {index + 1}
                    </span>
                    <code>
                      <CodeLine text={line.slice} />
                      {shown !== null && index + 1 === cursorLine ? (
                        <span className="ide-caret" aria-hidden="true" />
                      ) : null}
                    </code>
                  </li>
                ) : null,
              )}
            </ol>
            <div className="ide-minimap" aria-hidden="true">
              {file.lines.map((line, index) => (
                <span key={index} style={{ width: `${Math.min(100, line.length * 1.4)}%` }} />
              ))}
            </div>
          </div>
          {boot.ready ? (
            <IdeTerminal
              copy={copy}
              files={files}
              autoRun={boot.booting}
              onOpen={open}
              onExit={onExit}
              commandRef={terminalCommand}
            />
          ) : null}
        </div>
      </div>
      {palette ? <CommandPalette copy={copy} items={paletteItems} onClose={closePalette} /> : null}
      <div className="ide-bottom">
        <span>
          ⑂ main <span aria-hidden="true">·</span> ⊗ 0 ⚠ 0
        </span>
        <span className="ide-bottom-file">
          Ln {cursorLine}, Col 1 <span aria-hidden="true">·</span> UTF-8{' '}
          <span aria-hidden="true">·</span> {file.language}
        </span>
        <WorldControls locale={locale} onExit={onExit} />
      </div>
      <BootFinisher booting={boot.booting} ready={boot.ready} finish={boot.finish} />
    </>
  )
}

/** Marks the arrival as seen once the terminal has picked up its auto-run. */
function BootFinisher({
  booting,
  ready,
  finish,
}: {
  booting: boolean
  ready: boolean
  finish: () => void
}) {
  useEffect(() => {
    if (!ready || !booting) return
    const timer = window.setTimeout(finish, 3000)
    return () => window.clearTimeout(timer)
  }, [booting, ready, finish])
  return null
}
