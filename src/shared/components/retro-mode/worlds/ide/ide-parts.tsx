'use client'

import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/shared/components/motion'
import { playTones, type Tone } from '../world-sound'
import type { IdeCopy, IdeFile } from './ide-copy'

type TermLine = { id: number; text: string; kind?: 'cmd' | 'ok' | 'err' | 'dim' }

const READY: Tone[] = [
  { f: 880, at: 0, d: 0.08, v: 0.03 },
  { f: 1318.5, at: 0.08, d: 0.18, v: 0.03 },
]

const DEV_OUTPUT: Omit<TermLine, 'id'>[] = [
  { text: '> ranimontagna.com@2026.11.17 dev', kind: 'dim' },
  { text: '> next dev --turbopack', kind: 'dim' },
  { text: '' },
  { text: '   ▲ Next.js' },
  { text: '   - Local:   https://ranimontagna.com' },
  { text: '' },
  { text: ' ✓ Ready in 1998ms', kind: 'ok' },
]

const GIT_LOG = [
  '6e65648 feat(retro): Gazeta with a spinning EXTRA front page',
  '13b3108 feat(retro): Game Boy with power-on, sounds and Bug Hunt',
  '45e928e feat(retro): DOS world with BIOS, CRT and Tab completion',
  '607602f feat(retro): Windows 98 world with dial-up and a guestbook',
  '9eb7007 feat(retro): XP world with boot, windows and sounds',
]

const PROMPT = 'ranielli@portfolio ~ %'

/**
 * A small zsh: it runs the dev server on arrival, opens files in the editor
 * and answers a handful of commands. Nothing it prints is executed.
 */
export function IdeTerminal({
  copy,
  files,
  autoRun,
  onOpen,
  onExit,
  commandRef,
}: {
  copy: IdeCopy
  files: IdeFile[]
  autoRun: boolean
  onOpen: (name: string) => void
  onExit: () => void
  commandRef: { current: ((command: string) => void) | null }
}) {
  const inputId = useId()
  const [lines, setLines] = useState<TermLine[]>([])
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const nextId = useRef(1)
  const log = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const push = (items: Omit<TermLine, 'id'>[]) =>
    setLines((previous) =>
      [...previous, ...items.map((item) => ({ ...item, id: nextId.current++ }))].slice(-60),
    )

  function later(ms: number, run: () => void) {
    timers.current.push(window.setTimeout(run, ms))
  }

  function runDev(animated: boolean) {
    if (!animated) {
      push(DEV_OUTPUT)
      return
    }
    setBusy(true)
    DEV_OUTPUT.forEach((line, index) => {
      later(220 + index * 170, () => push([line]))
    })
    later(220 + DEV_OUTPUT.length * 170, () => {
      setBusy(false)
      playTones(READY)
    })
  }

  function find(name: string) {
    const wanted = name.toLowerCase()
    return files.find((file) => file.name.toLowerCase() === wanted)
  }

  function run(raw: string) {
    const command = raw.trim()
    if (!command) return
    push([{ text: `${PROMPT} ${command}`, kind: 'cmd' }])
    const [name, ...rest] = command.split(/\s+/)
    const argument = rest.join(' ')
    switch (name.toLowerCase()) {
      case 'help':
        push([{ text: copy.help }])
        return
      case 'ls':
        push([{ text: files.map((file) => file.name).join('   ') }])
        return
      case 'clear':
        setLines([])
        return
      case 'whoami':
        push([{ text: copy.whoami }])
        return
      case 'exit':
        onExit()
        return
      case 'npm':
        if (argument === 'run dev') {
          runDev(!prefersReducedMotion())
          return
        }
        if (argument === 'test' || argument === 't') {
          push([
            ...files.map((file) => ({ text: ` ✓ ${file.name}`, kind: 'ok' as const })),
            { text: '' },
            { text: copy.tests, kind: 'ok' },
          ])
          return
        }
        break
      case 'git':
        if (argument.startsWith('log')) {
          push(GIT_LOG.map((text) => ({ text })))
          return
        }
        break
      case 'cat': {
        const file = find(argument)
        if (!file) push([{ text: copy.noFile(argument), kind: 'err' }])
        else push(file.lines.map((text) => ({ text })))
        return
      }
      case 'open':
      case 'code': {
        const file = find(argument)
        if (!file) push([{ text: copy.noFile(argument), kind: 'err' }])
        else onOpen(file.name)
        return
      }
    }
    push([{ text: copy.notFound(command), kind: 'err' }])
  }

  // Others (the palette) can run commands here too.
  commandRef.current = run

  // Arrival: type npm run dev and start the server.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once, on arrival.
  useEffect(() => {
    if (!autoRun || prefersReducedMotion()) {
      push([{ text: copy.tip, kind: 'dim' }])
      return
    }
    const typed = 'npm run dev'
    setBusy(true)
    ;[...typed].forEach((_, index) => {
      later(300 + index * 55, () => setValue(typed.slice(0, index + 1)))
    })
    later(300 + typed.length * 55 + 250, () => {
      setValue('')
      push([{ text: `${PROMPT} ${typed}`, kind: 'cmd' }])
      runDev(true)
    })
    return () => {
      for (const timer of timers.current) window.clearTimeout(timer)
      timers.current = []
    }
  }, [])

  useEffect(() => {
    if (log.current && lines.length > 0) log.current.scrollTop = log.current.scrollHeight
  }, [lines])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    run(value)
    setValue('')
  }

  return (
    <section className="ide-terminal" aria-label={copy.terminal}>
      <div className="ide-panel-tabs" aria-hidden="true">
        <span>{copy.problems}</span>
        <span>{copy.output}</span>
        <span data-active>{copy.terminal}</span>
        <span className="ide-panel-shell">zsh</span>
      </div>
      <div ref={log} className="ide-terminal-log" role="log" aria-live="polite">
        {lines.map((line) => (
          <p key={line.id} data-kind={line.kind}>
            {line.text || ' '}
          </p>
        ))}
      </div>
      <form className="ide-terminal-form" onSubmit={submit}>
        <label htmlFor={inputId} className="sr-only">
          {copy.command}
        </label>
        <span aria-hidden="true">{PROMPT}</span>
        <input
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={120}
          readOnly={busy}
        />
      </form>
    </section>
  )
}

export type PaletteItem = { id: string; label: string; detail?: string; run: () => void }

function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** ⌘P: type to filter files and commands, arrows to pick, Enter to run. */
export function CommandPalette({
  copy,
  items,
  onClose,
}: {
  copy: IdeCopy
  items: PaletteItem[]
  onClose: () => void
}) {
  const listId = useId()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const wanted = normalize(query.replace(/^>\s*/, ''))
    return items.filter((item) => normalize(`${item.label} ${item.detail ?? ''}`).includes(wanted))
  }, [items, query])

  useEffect(() => {
    input.current?.focus({ preventScroll: true })
  }, [])

  function choose(item: PaletteItem | undefined) {
    if (!item) return
    onClose()
    item.run()
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the backdrop closes on click like the editor's.
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape closes from the input.
    <div className="ide-palette-backdrop" onClick={onClose}>
      <div
        className="ide-palette"
        role="dialog"
        aria-modal="true"
        aria-label={copy.palette}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onClose()
          }
        }}
      >
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
          aria-label={copy.paletteHint}
          placeholder={copy.paletteHint}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActive((value) => Math.min(results.length - 1, value + 1))
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActive((value) => Math.max(0, value - 1))
            } else if (event.key === 'Enter') {
              event.preventDefault()
              choose(results[active])
            }
          }}
        />
        <div id={listId} role="listbox" aria-label={copy.palette} className="ide-palette-list">
          {results.length === 0 ? <p className="ide-palette-empty">{copy.noResults}</p> : null}
          {results.map((item, index) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: the combobox input handles the keyboard (aria-activedescendant).
            <div
              key={item.id}
              id={`${listId}-${item.id}`}
              role="option"
              tabIndex={-1}
              aria-selected={index === active}
              onPointerMove={() => setActive(index)}
              onClick={() => choose(item)}
            >
              <span>{item.label}</span>
              {item.detail ? <small>{item.detail}</small> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
